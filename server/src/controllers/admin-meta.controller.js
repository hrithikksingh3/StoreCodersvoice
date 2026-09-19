const AuditLog = require('../models/AuditLog'); const Setting = require('../models/Setting'); const Product = require('../models/Product'); const BlogPost = require('../models/BlogPost'); const Order = require('../models/Order'); const { pagination } = require('../utils/content'); const audit = require('../utils/audit');
exports.dashboard = async (_req, res, next) => { try {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setUTCDate(today.getUTCDate() - 6);
  sevenDaysAgo.setUTCHours(0, 0, 0, 0);
  const [products, blogs, productStatuses, paymentSummary, fulfillmentSummary, recentOrders, dailyRevenue] = await Promise.all([
    Product.countDocuments(),
    BlogPost.countDocuments(),
    Product.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] } } } }]),
    Order.aggregate([{ $group: { _id: '$fulfillmentStatus', count: { $sum: 1 } } }]),
    Order.find().sort({ createdAt: -1 }).limit(6).select('productName email amount status fulfillmentStatus fulfillmentError createdAt').lean(),
    Order.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' } }, revenue: { $sum: '$amount' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);
  const countByStatus = (entries) => Object.fromEntries(entries.map((entry) => [entry._id || 'pending', entry.count]));
  const productsByStatus = countByStatus(productStatuses);
  const paymentsByStatus = countByStatus(paymentSummary);
  const fulfillment = countByStatus(fulfillmentSummary);
  const revenue = paymentSummary.reduce((sum, entry) => sum + Number(entry.revenue || 0), 0);
  const sales = Object.fromEntries(dailyRevenue.map((entry) => [entry._id, { revenue: Number(entry.revenue || 0), orders: entry.orders }]));
  const salesTrend = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(sevenDaysAgo);
    date.setUTCDate(sevenDaysAgo.getUTCDate() + offset);
    const key = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    return { date: key, label: date.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'Asia/Kolkata' }), ...(sales[key] || { revenue: 0, orders: 0 }) };
  });
  res.json({ success: true, stats: {
    products, blogs, orders: paymentSummary.reduce((sum, entry) => sum + entry.count, 0), paidOrders: paymentsByStatus.paid || 0, revenue,
    productVisibility: { published: productsByStatus.published || 0, hidden: productsByStatus.hidden || 0, draft: productsByStatus.draft || 0, archived: productsByStatus.archived || 0 },
    fulfillment: { delivered: fulfillment.delivered || 0, failed: fulfillment.failed || 0, processing: fulfillment.processing || 0, pending: fulfillment.pending || 0 },
    salesTrend, recentOrders,
  } });
} catch (error) { next(error); } };
exports.auditLogs = async (req, res, next) => { try { const { page, limit } = pagination(req.query); const query = {}; if (req.query.entityType && text(req.query.entityType, 40)) query.entityType = req.query.entityType; if (req.query.action && text(req.query.action, 80)) query.action = req.query.action; if (req.query.q && text(req.query.q, 120)) { const q = new RegExp(req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); query.$or = [{ action: q }, { entityType: q }, { summary: q }, { entityId: q }]; } const from = req.query.from && new Date(req.query.from); const to = req.query.to && new Date(req.query.to); if (to && !Number.isNaN(to.valueOf())) to.setUTCHours(23, 59, 59, 999); if (from && !Number.isNaN(from.valueOf())) query.createdAt = { ...(query.createdAt || {}), $gte: from }; if (to && !Number.isNaN(to.valueOf())) query.createdAt = { ...(query.createdAt || {}), $lte: to }; const [items, total] = await Promise.all([AuditLog.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('actor', 'email name').lean(), AuditLog.countDocuments(query)]); res.json({ success: true, items, page, limit, total, pages: Math.ceil(total / limit) }); } catch (error) { next(error); } };
exports.getSettings = async (_req, res, next) => { try { const item = await Setting.findOneAndUpdate({ key: 'store' }, { $setOnInsert: { key: 'store' } }, { new: true, upsert: true }); res.json({ success: true, item }); } catch (error) { next(error); } };
exports.updateSettings = async (req, res, next) => { try { const allowed = ['storeName', 'currency', 'defaultAuthor', 'siteTitle', 'defaultDescription', 'defaultOgImage']; const update = Object.fromEntries(allowed.filter((key) => Object.hasOwn(req.body, key)).map((key) => [key, req.body[key]])); const item = await Setting.findOneAndUpdate({ key: 'store' }, update, { new: true, upsert: true, runValidators: true }); await audit(req, 'SETTINGS_UPDATED', 'settings', item, 'Updated public store settings'); res.json({ success: true, item }); } catch (error) { next(error); } };
