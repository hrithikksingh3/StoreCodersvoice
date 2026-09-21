const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

const MAX_PRODUCT_FILTERS = 100;
const MAX_REVENUE_ORDERS = 5000;

const parseDate = (value, endOfDay = false) => {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.valueOf())) return null;
  if (endOfDay) date.setUTCHours(23, 59, 59, 999);
  return date;
};

const percentage = (value, fallback = 100) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100 ? parsed : fallback;
};

const selectedProductIds = (value) => {
  if (!value) return [];
  const ids = [...new Set(String(value).split(',').map((item) => item.trim()).filter(Boolean))];
  if (ids.length > MAX_PRODUCT_FILTERS || ids.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    const error = new Error(`Select up to ${MAX_PRODUCT_FILTERS} valid products.`);
    error.status = 400;
    throw error;
  }
  return ids;
};

const revenueQuery = (query) => {
  const from = parseDate(query.from);
  const to = parseDate(query.to, true);
  if ((query.from && !from) || (query.to && !to) || (from && to && from > to)) {
    const error = new Error('Choose a valid revenue date range.');
    error.status = 400;
    throw error;
  }
  const productIds = selectedProductIds(query.productIds);
  const salesDateRange = from || to ? { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) } : null;
  return {
    filter: {
      status: 'paid',
      ...(productIds.length ? { productId: { $in: productIds } } : {}),
      ...(salesDateRange ? { $or: [
        { paymentCapturedAt: salesDateRange },
        { paymentCapturedAt: null, createdAt: salesDateRange },
        { paymentCapturedAt: { $exists: false }, createdAt: salesDateRange },
      ] } : {}),
    },
    productIds,
    from,
    to,
    defaultOwnerShare: percentage(query.defaultOwnerShare, 100),
  };
};

const dayKey = (value) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(value));

async function calculateRevenue(query) {
  const plan = revenueQuery(query);
  const orders = await Order.find(plan.filter)
    .select('productId product productName email amount status paymentMethod paymentCapturedAt createdAt ownerSharePercent razorpayPaymentId razorpayOrderId')
    .sort({ createdAt: -1 })
    .limit(MAX_REVENUE_ORDERS)
    .lean();
  const productObjectIds = [...new Set(orders.map((order) => String(order.product || order.productId)).filter((id) => mongoose.Types.ObjectId.isValid(id)))];
  const products = productObjectIds.length
    ? await Product.find({ _id: { $in: productObjectIds } }).select('name ownerSharePercent').lean()
    : [];
  const productShares = new Map(products.map((product) => [String(product._id), percentage(product.ownerSharePercent, plan.defaultOwnerShare)]));
  const productsById = new Map(products.map((product) => [String(product._id), product]));
  const buckets = new Map();
  const trend = new Map();

  const rows = orders.map((order) => {
    const productKey = String(order.product || order.productId || 'unknown');
    const storedShare = Number(order.ownerSharePercent);
    const hasSnapshot = Number.isFinite(storedShare) && storedShare >= 0 && storedShare <= 100;
    const ownerSharePercent = hasSnapshot ? storedShare : (productShares.get(productKey) ?? plan.defaultOwnerShare);
    const gross = Number(order.amount || 0);
    const ownerRevenue = Math.round(gross * ownerSharePercent * 100) / 10000;
    const partnerRevenue = Math.round((gross - ownerRevenue) * 100) / 100;
    const paidAt = order.paymentCapturedAt || order.createdAt;
    const product = productsById.get(productKey);
    const bucket = buckets.get(productKey) || { productId: productKey, productName: order.productName || product?.name || 'Unknown product', orders: 0, grossRevenue: 0, ownerRevenue: 0, partnerRevenue: 0, ownerSharePercent, shareSource: hasSnapshot ? 'order snapshot' : (product ? 'current product setting' : 'report fallback') };
    bucket.orders += 1;
    bucket.grossRevenue += gross;
    bucket.ownerRevenue += ownerRevenue;
    bucket.partnerRevenue += partnerRevenue;
    buckets.set(productKey, bucket);
    const date = dayKey(paidAt);
    const point = trend.get(date) || { date, grossRevenue: 0, ownerRevenue: 0, partnerRevenue: 0, orders: 0 };
    point.grossRevenue += gross;
    point.ownerRevenue += ownerRevenue;
    point.partnerRevenue += partnerRevenue;
    point.orders += 1;
    trend.set(date, point);
    return {
      product: bucket.productName,
      customer: order.email,
      transaction: order.razorpayPaymentId || order.razorpayOrderId || '—',
      grossRevenue: gross,
      ownerSharePercent,
      ownerRevenue,
      partnerRevenue,
      paymentMethod: order.paymentMethod || 'Not captured',
      paidAt,
      shareSource: bucket.shareSource,
    };
  });

  const totals = rows.reduce((result, row) => ({
    grossRevenue: result.grossRevenue + row.grossRevenue,
    ownerRevenue: result.ownerRevenue + row.ownerRevenue,
    partnerRevenue: result.partnerRevenue + row.partnerRevenue,
  }), { grossRevenue: 0, ownerRevenue: 0, partnerRevenue: 0 });
  const summary = {
    paidOrders: rows.length,
    grossRevenue: Math.round(totals.grossRevenue * 100) / 100,
    ownerRevenue: Math.round(totals.ownerRevenue * 100) / 100,
    partnerRevenue: Math.round(totals.partnerRevenue * 100) / 100,
    averageOrderValue: rows.length ? Math.round((totals.grossRevenue / rows.length) * 100) / 100 : 0,
    ownerMarginPercent: totals.grossRevenue ? Math.round((totals.ownerRevenue / totals.grossRevenue) * 10000) / 100 : 0,
  };
  return {
    ...plan,
    summary,
    products: [...buckets.values()].sort((a, b) => b.grossRevenue - a.grossRevenue),
    trend: [...trend.values()].sort((a, b) => a.date.localeCompare(b.date)),
    rows,
    truncated: orders.length === MAX_REVENUE_ORDERS,
  };
}

exports.productOptions = async (_req, res, next) => { try {
  const items = await Product.find({}).select('name slug ownerSharePercent status').sort({ name: 1 }).limit(1000).lean();
  res.json({ success: true, items: items.map((item) => ({ id: String(item._id), name: item.name, slug: item.slug, ownerSharePercent: percentage(item.ownerSharePercent, 100), status: item.status })) });
} catch (error) { next(error); } };

exports.analytics = async (req, res, next) => { try {
  const result = await calculateRevenue(req.query);
  res.json({
    success: true,
    summary: result.summary,
    products: result.products,
    trend: result.trend,
    range: { from: result.from, to: result.to },
    defaultOwnerShare: result.defaultOwnerShare,
    truncated: result.truncated,
  });
} catch (error) { next(error); } };

module.exports.calculateRevenue = calculateRevenue;
module.exports.revenueQuery = revenueQuery;
