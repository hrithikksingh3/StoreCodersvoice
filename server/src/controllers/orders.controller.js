const crypto = require('crypto'); const Order = require('../models/Order'); const Product = require('../models/Product'); const { pagination, text } = require('../utils/content'); const postPaymentActions = require('../utils/postPaymentActions'); const sendMail = require('../utils/sendMail'); const audit = require('../utils/audit');
const downloadToken = (id, email) => crypto.createHmac('sha256', process.env.DOWNLOAD_TOKEN_SECRET || process.env.JWT_SECRET).update(`${id}:${email}`).digest('hex');
const adminOrderFields = 'email customerName phone productId productName productSlug amount status fulfillmentStatus fulfillmentError fulfillmentEmailId razorpayOrderId razorpayPaymentId paymentMethod paymentCapturedAt checkoutReminderSentAt createdAt updatedAt';
const REMINDER_COOLDOWN_MS = 12 * 60 * 60 * 1000;
const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const publicSiteUrl = () => String(process.env.PUBLIC_SITE_URL || process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim().replace(/\/$/, '');
const publicApiUrl = () => String(process.env.PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
const productUrl = (slug) => `${publicSiteUrl()}/product/${encodeURIComponent(slug)}`;
const productShareUrl = (slug) => `${publicApiUrl()}/api/share/product/${encodeURIComponent(slug)}`;
const isPendingPayment = (order) => ['created', 'failed'].includes(order.status);
const withProductLinks = async (items) => {
  const ids = [...new Set(items.map((item) => String(item.productId || '')).filter((id) => /^[a-f\d]{24}$/i.test(id)))];
  if (!ids.length) return items;
  const products = await Product.find({ _id: { $in: ids } }).select('_id slug status').lean();
  const byId = new Map(products.map((product) => [String(product._id), product]));
  return items.map((item) => {
    const product = byId.get(String(item.productId));
    const slug = item.productSlug || product?.slug;
    return {
      ...item,
      productSlug: slug || undefined,
      productUrl: product?.status === 'published' && slug ? productUrl(slug) : undefined,
      productShareUrl: product?.status === 'published' && slug ? productShareUrl(slug) : undefined,
    };
  });
};
const buildOrderQuery = (req, includeMethod = false) => {
  const query = {};
  if (['created', 'paid', 'failed'].includes(req.query.status)) query.status = req.query.status;
  if (includeMethod && req.query.method && text(req.query.method, 50)) query.paymentMethod = req.query.method;
  if (req.query.q && text(req.query.q, 120)) {
    const q = new RegExp(req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ email: q }, { customerName: q }, { phone: q }, { productName: q }, { razorpayOrderId: q }, { razorpayPaymentId: q }, ...(includeMethod ? [{ paymentMethod: q }] : [])];
  }
  const from = req.query.from && new Date(req.query.from); const to = req.query.to && new Date(req.query.to);
  if (to && !Number.isNaN(to.valueOf())) to.setUTCHours(23, 59, 59, 999);
  if (from && !Number.isNaN(from.valueOf())) query.createdAt = { ...(query.createdAt || {}), $gte: from };
  if (to && !Number.isNaN(to.valueOf())) query.createdAt = { ...(query.createdAt || {}), $lte: to };
  return query;
};
exports.listAdmin = async (req, res, next) => { try { const { page, limit } = pagination(req.query); const query = buildOrderQuery(req); const [items, total] = await Promise.all([Order.find(query).select(adminOrderFields).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Order.countDocuments(query)]); res.json({ success: true, items: await withProductLinks(items), page, limit, total, pages: Math.ceil(total / limit) }); } catch (error) { next(error); } };
exports.listPayments = async (req, res, next) => { try {
  const { page, limit } = pagination(req.query); const query = buildOrderQuery(req, true);
  const sortMap = { newest: { paymentCapturedAt: -1, createdAt: -1 }, oldest: { paymentCapturedAt: 1, createdAt: 1 }, 'amount-high': { amount: -1, createdAt: -1 }, 'amount-low': { amount: 1, createdAt: -1 } };
  const sort = sortMap[req.query.sort] || sortMap.newest;
  const [items, total] = await Promise.all([Order.find(query).select(adminOrderFields).sort(sort).skip((page - 1) * limit).limit(limit).lean(), Order.countDocuments(query)]);
  res.json({ success: true, items: await withProductLinks(items), page, limit, total, pages: Math.ceil(total / limit) });
} catch (error) { next(error); } };
exports.download = async (req, res, next) => { try { const email = String(req.query.email || '').trim().toLowerCase(); const token = String(req.query.token || ''); const expected = downloadToken(req.params.id, email); if (!token || token.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))) return res.status(403).json({ success: false, message: 'Download is unavailable' }); const order = await Order.findOne({ _id: req.params.id, email, status: 'paid' }); if (!order || !order.downloadUrl) return res.status(404).json({ success: false, message: 'Download is unavailable' }); return res.redirect(302, order.downloadUrl); } catch (error) { next(error); } };
exports.resendEmail = async (req, res, next) => { try { const order = await Order.findById(req.params.id); if (!order) return res.status(404).json({ success: false, message: 'Order not found' }); if (order.status !== 'paid') return res.status(400).json({ success: false, message: 'Only paid orders can receive a delivery email' }); const result = await postPaymentActions(order._id, { retry: true }); if (result.skipped) return res.status(409).json({ success: false, message: result.reason }); await audit(req, 'ORDER_EMAIL_RESENT', 'order', order, `Resent delivery email for ${order.productName}`); res.json({ success: true, item: result }); } catch (error) { next(error); } };
exports.sendCheckoutReminder = async (req, res, next) => { try {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (!isPendingPayment(order)) return res.status(400).json({ success: false, message: 'Checkout reminders are available only for unpaid or failed payments' });
  if (order.checkoutReminderSentAt && Date.now() - new Date(order.checkoutReminderSentAt).valueOf() < REMINDER_COOLDOWN_MS) {
    return res.status(429).json({ success: false, message: 'A checkout reminder was already sent recently. Try again in 12 hours.' });
  }
  if (!/^[a-f\d]{24}$/i.test(String(order.productId || ''))) return res.status(400).json({ success: false, message: 'This order has no valid product reference' });
  const product = await Product.findOne({ _id: order.productId, status: 'published' }).select('name slug shortDescription price isFree').lean();
  if (!product?.slug) return res.status(409).json({ success: false, message: 'This product is no longer available in the public Store' });

  const checkoutUrl = productUrl(product.slug);
  const name = escapeHtml(order.customerName || 'there');
  const productName = escapeHtml(product.name || order.productName);
  const description = escapeHtml(product.shortDescription || '');
  const price = product.isFree ? 'Free gift' : `₹${Number(product.price || order.amount || 0).toLocaleString('en-IN')}`;
  let provider;
  try {
    provider = await sendMail({
      to: order.email,
      subject: `Still interested in ${product.name}? | CodersVoice`,
      html: `<div style="font-family:Inter,Arial,sans-serif;background:#0b0f1a;padding:40px"><div style="max-width:600px;margin:auto;background:#111827;border-radius:14px;padding:32px;color:#e5e7eb"><p style="margin:0 0 12px;color:#8b5cf6;font-weight:800;letter-spacing:.08em;font-size:12px">CODERSVOICE</p><h1 style="margin:0 0 16px;color:#f8fafc;font-size:28px;line-height:1.2">Your pick is waiting</h1><p style="color:#cbd5f5;font-size:15px;line-height:1.6">Hello ${name},</p><p style="color:#cbd5f5;font-size:15px;line-height:1.6">You were looking at <b>${productName}</b>. If you are still interested, you can return to the product page and complete checkout whenever you are ready.</p><div style="margin:24px 0;padding:20px;background:#020617;border:1px solid #1e293b;border-radius:12px"><p style="margin:0;color:#f8fafc;font-weight:700">${productName}</p>${description ? `<p style="margin:8px 0 0;color:#94a3b8;font-size:14px;line-height:1.5">${description}</p>` : ''}<p style="margin:12px 0 0;color:#67e8f9;font-weight:700">${price}</p></div><div style="margin:28px 0;text-align:center"><a href="${checkoutUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 22px;background:linear-gradient(90deg,#7b61ff,#00f0ff);color:#020617;text-decoration:none;font-weight:800;border-radius:10px">Continue to product</a></div><p style="font-size:13px;color:#94a3b8;text-align:center">This reminder was sent because a checkout was started with this email.<br/>— Team CodersVoice</p></div></div>`,
    });
  } catch (error) {
    console.error('Checkout reminder email failed:', error.message);
    return res.status(502).json({ success: false, message: 'The email provider could not send this reminder. Please try again later.' });
  }
  order.checkoutReminderSentAt = new Date();
  order.checkoutReminderEmailId = provider.id;
  await order.save();
  await audit(req, 'ORDER_CHECKOUT_REMINDER_SENT', 'order', order, `Sent checkout reminder for ${order.productName}`);
  res.json({ success: true, item: { emailId: provider.id, checkoutUrl } });
} catch (error) { next(error); } };
