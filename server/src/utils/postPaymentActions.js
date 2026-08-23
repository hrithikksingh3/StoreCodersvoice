const crypto = require('crypto');
const Order = require('../models/Order');
const generateInvoice = require('./generateInvoice');
const sendMail = require('./sendMail');

const getDeliveryConfig = () => {
  const apiUrl = (process.env.PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
  const secret = process.env.DOWNLOAD_TOKEN_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error('Download token secret is not configured');
  if (process.env.NODE_ENV === 'production' && !/^https:\/\//i.test(apiUrl)) {
    throw new Error('PUBLIC_API_URL must be an https URL in production');
  }
  return { apiUrl, secret };
};

module.exports = async function postPaymentActions(orderId, { retry = false } = {}) {
  const eligibleStates = retry ? ['pending', 'failed', 'delivered'] : ['pending'];
  const claimed = await Order.findOneAndUpdate(
    { _id: orderId, fulfillmentStatus: { $in: eligibleStates } },
    {
      $set: { fulfillmentStatus: 'processing', fulfillmentAttemptedAt: new Date() },
      $unset: { fulfillmentError: 1 },
    },
    { new: true },
  );
  if (!claimed) return { skipped: true, reason: 'Delivery is already being processed or the order does not exist.' };

  try {
    const invoiceBuffer = await generateInvoice(claimed);
    const { apiUrl, secret } = getDeliveryConfig();
    const token = crypto.createHmac('sha256', secret).update(`${claimed._id}:${claimed.email}`).digest('hex');
    const downloadLink = `${apiUrl}/api/orders/${claimed._id}/download?email=${encodeURIComponent(claimed.email)}&token=${token}`;
    const email = await sendMail({
      to: claimed.email,
      subject: `Your ${claimed.productName} – CodersVoice`,
      html: `<div style="font-family:Inter,Arial,sans-serif;background:#0b0f1a;padding:40px"><div style="max-width:600px;margin:auto;background:#111827;border-radius:14px;padding:32px;color:#e5e7eb"><h2 style="margin:0 0 10px;color:#8b5cf6;">Payment Successful 🎉</h2><p style="color:#cbd5f5;font-size:15px;">Thanks for purchasing <b>${claimed.productName}</b> from <b>CodersVoice</b>.</p><div style="margin:28px 0;padding:20px;background:#020617;border-radius:12px;text-align:center"><p style="margin-bottom:14px;font-size:14px;color:#94a3b8">Click below to download your source code</p><a href="${downloadLink}" target="_blank" style="display:inline-block;padding:14px 22px;background:linear-gradient(90deg,#7b61ff,#00f0ff);color:#020617;text-decoration:none;font-weight:700;border-radius:10px">⬇ Download Source Code</a></div><p style="font-size:13px;color:#94a3b8;text-align:center">If you face any issue, just reply to this email.<br/>— Team CodersVoice</p></div></div>`,
      attachments: [{ filename: `CodersVoice-Invoice-${claimed._id}.pdf`, content: invoiceBuffer, contentType: 'application/pdf' }],
    });
    await Order.findByIdAndUpdate(claimed._id, {
      $set: { fulfillmentStatus: 'delivered', fulfillmentEmailId: email.id, fulfilledAt: new Date() },
      $unset: { fulfillmentError: 1 },
    });
    return { delivered: true, emailId: email.id };
  } catch (error) {
    const message = String(error.message || 'Email fulfillment failed').slice(0, 500);
    await Order.findByIdAndUpdate(claimed._id, { $set: { fulfillmentStatus: 'failed', fulfillmentError: message } });
    throw error;
  }
};
