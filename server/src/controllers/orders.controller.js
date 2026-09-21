const crypto = require('crypto'); const Order = require('../models/Order'); const { pagination, text } = require('../utils/content'); const postPaymentActions = require('../utils/postPaymentActions'); const audit = require('../utils/audit');
const downloadToken = (id, email) => crypto.createHmac('sha256', process.env.DOWNLOAD_TOKEN_SECRET || process.env.JWT_SECRET).update(`${id}:${email}`).digest('hex');
const adminOrderFields = 'email productId productName amount status fulfillmentStatus fulfillmentError fulfillmentEmailId razorpayOrderId razorpayPaymentId paymentMethod paymentCapturedAt createdAt updatedAt';
const buildOrderQuery = (req, includeMethod = false) => {
  const query = {};
  if (['created', 'paid', 'failed'].includes(req.query.status)) query.status = req.query.status;
  if (includeMethod && req.query.method && text(req.query.method, 50)) query.paymentMethod = req.query.method;
  if (req.query.q && text(req.query.q, 120)) {
    const q = new RegExp(req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ email: q }, { productName: q }, { razorpayOrderId: q }, { razorpayPaymentId: q }, ...(includeMethod ? [{ paymentMethod: q }] : [])];
  }
  const from = req.query.from && new Date(req.query.from); const to = req.query.to && new Date(req.query.to);
  if (to && !Number.isNaN(to.valueOf())) to.setUTCHours(23, 59, 59, 999);
  if (from && !Number.isNaN(from.valueOf())) query.createdAt = { ...(query.createdAt || {}), $gte: from };
  if (to && !Number.isNaN(to.valueOf())) query.createdAt = { ...(query.createdAt || {}), $lte: to };
  return query;
};
exports.listAdmin = async (req, res, next) => { try { const { page, limit } = pagination(req.query); const query = buildOrderQuery(req); const [items, total] = await Promise.all([Order.find(query).select(adminOrderFields).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Order.countDocuments(query)]); res.json({ success: true, items, page, limit, total, pages: Math.ceil(total / limit) }); } catch (error) { next(error); } };
exports.listPayments = async (req, res, next) => { try {
  const { page, limit } = pagination(req.query); const query = buildOrderQuery(req, true);
  const sortMap = { newest: { paymentCapturedAt: -1, createdAt: -1 }, oldest: { paymentCapturedAt: 1, createdAt: 1 }, 'amount-high': { amount: -1, createdAt: -1 }, 'amount-low': { amount: 1, createdAt: -1 } };
  const sort = sortMap[req.query.sort] || sortMap.newest;
  const [items, total] = await Promise.all([Order.find(query).select(adminOrderFields).sort(sort).skip((page - 1) * limit).limit(limit).lean(), Order.countDocuments(query)]);
  res.json({ success: true, items, page, limit, total, pages: Math.ceil(total / limit) });
} catch (error) { next(error); } };
exports.download = async (req, res, next) => { try { const email = String(req.query.email || '').trim().toLowerCase(); const token = String(req.query.token || ''); const expected = downloadToken(req.params.id, email); if (!token || token.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))) return res.status(403).json({ success: false, message: 'Download is unavailable' }); const order = await Order.findOne({ _id: req.params.id, email, status: 'paid' }); if (!order || !order.downloadUrl) return res.status(404).json({ success: false, message: 'Download is unavailable' }); return res.redirect(302, order.downloadUrl); } catch (error) { next(error); } };
exports.resendEmail = async (req, res, next) => { try { const order = await Order.findById(req.params.id); if (!order) return res.status(404).json({ success: false, message: 'Order not found' }); if (order.status !== 'paid') return res.status(400).json({ success: false, message: 'Only paid orders can receive a delivery email' }); const result = await postPaymentActions(order._id, { retry: true }); if (result.skipped) return res.status(409).json({ success: false, message: result.reason }); await audit(req, 'ORDER_EMAIL_RESENT', 'order', order, `Resent delivery email for ${order.productName}`); res.json({ success: true, item: result }); } catch (error) { next(error); } };
