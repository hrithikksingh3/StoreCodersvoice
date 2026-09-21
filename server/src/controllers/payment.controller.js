const crypto = require("crypto");
const getRazorpay = require("../config/razorpay");
const Order = require("../models/Order");
const sendMail = require("../utils/sendMail");
const Product = require("../models/Product");
const generateInvoice = require("../utils/generateInvoice");
const postPaymentActions = require("../utils/postPaymentActions");



/* ===============================
   1️⃣ CREATE ORDER
================================ */
exports.createOrder = async (req, res) => {
  try {
    const { productId, email } = req.body;

    if (typeof productId !== 'string' || !productId || productId.length > 100) {
      return res.status(400).json({ message: "Invalid product selected" });
    }

    if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
      return res.status(400).json({ message: "Email is required" });
    }

    // A product ID is preferred. Slug lookup keeps existing checkout links working.
    const product = await Product.findOne({
      status: 'published',
      ...( /^[a-f\d]{24}$/i.test(productId) ? { _id: productId } : { slug: productId })
    });

    if (!product || !product.downloadUrl) {
      return res.status(404).json({ message: "This product is not available for purchase" });
    }

    const amountInPaise = product.price * 100;

    // 🔁 Create Razorpay order
    const razorpayOrder = await getRazorpay().orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    });

    // 🧾 Save order snapshot in DB
    await Order.create({
      email: email.trim().toLowerCase(),
      productId: String(product._id),
      product: product._id,
      productName: product.name,
      amount: product.price,
      ownerSharePercent: Number.isFinite(Number(product.ownerSharePercent)) ? Number(product.ownerSharePercent) : 100,
      downloadUrl: product.downloadUrl, // ✅ snapshot
      razorpayOrderId: razorpayOrder.id,
      status: "created"
    });

    // ✅ Send to frontend
    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      productName: product.name,
      key: process.env.RAZORPAY_KEY
    });

  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(500).json({ message: "Order creation failed" });
  }
};


/* ===============================
   2️⃣ VERIFY PAYMENT
================================ */
// exports.verifyPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature
//     } = req.body;

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({ message: "Missing payment details" });
//     }

//     // 🔐 Verify signature
//     const payload = `${razorpay_order_id}|${razorpay_payment_id}`;

//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_SECRET)
//       .update(payload)
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({ message: "Invalid payment signature" });
//     }

//     // ✅ Mark order as paid
//     const order = await Order.findOneAndUpdate(
//       { razorpayOrderId: razorpay_order_id },
//       {
//         status: "paid",
//         razorpayPaymentId: razorpay_payment_id
//       },
//       { new: true }
//     );

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     if (!order.downloadUrl) {
//       throw new Error("Download link missing in order");
//     }

//     // 🧾 Generate invoice PDF
// const invoiceBuffer = await generateInvoice(order);


//     // 📧 Send email
//     await sendMail({
//       to: order.email,
//       subject: `Your ${order.productName} – CodersVoice`,
//       html: `
//       <div style="font-family:Inter,Arial,sans-serif;background:#0b0f1a;padding:40px">
//         <div style="max-width:600px;margin:auto;background:#111827;border-radius:14px;padding:32px;color:#e5e7eb">
          
//           <h2 style="margin:0 0 10px;color:#8b5cf6;">Payment Successful 🎉</h2>
//           <p style="color:#cbd5f5;font-size:15px;">
//             Thanks for purchasing <b>${order.productName}</b> from <b>CodersVoice</b>.
//           </p>

//           <div style="margin:28px 0;padding:20px;background:#020617;border-radius:12px;text-align:center">
//             <p style="margin-bottom:14px;font-size:14px;color:#94a3b8">
//               Click below to download your source code
//             </p>

//             <a href="${order.downloadUrl}"
//                target="_blank"
//                style="
//                  display:inline-block;
//                  padding:14px 22px;
//                  background:linear-gradient(90deg,#7b61ff,#00f0ff);
//                  color:#020617;
//                  text-decoration:none;
//                  font-weight:700;
//                  border-radius:10px;
//                ">
//               ⬇ Download Source Code
//             </a>
//           </div>

//           <p style="font-size:13px;color:#94a3b8;text-align:center">
//             If you face any issue, just reply to this email.<br/>
//             — Team CodersVoice
//           </p>

//         </div>
//       </div>
//       `,
//         attachments: [
//     {
//       filename: `CodersVoice-Invoice-${order._id}.pdf`,
//       content: invoiceBuffer,
//       contentType: "application/pdf"
//     }
//   ]
//     });

//     res.json({ success: true });

//   } catch (err) {
//     console.error("VERIFY PAYMENT ERROR:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(payload)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const receivedBuffer = Buffer.from(String(razorpay_signature), 'utf8');
    if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const existingPayment = await Order.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existingPayment && existingPayment.razorpayOrderId !== razorpay_order_id) return res.status(409).json({ message: 'Payment belongs to another order' });
    const current = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!current) return res.status(404).json({ message: "Order not found" });
    if (current.status === 'paid') {
      if (['pending', 'failed'].includes(current.fulfillmentStatus || 'pending')) {
        void postPaymentActions(current._id, { retry: true }).catch((error) => {
          console.error('Retrying payment fulfillment failed:', error.message);
        });
      }
      return res.json({ success: true, alreadyProcessed: true, fulfillmentStatus: current.fulfillmentStatus || 'pending' });
    }
    let providerPayment = {};
    try {
      const payment = await getRazorpay().payments.fetch(razorpay_payment_id);
      if (payment.order_id !== razorpay_order_id || Number(payment.amount) !== Number(current.amount) * 100 || payment.currency !== 'INR') {
        return res.status(400).json({ message: 'Payment details do not match this order' });
      }
      providerPayment = {
        paymentMethod: String(payment.method || '').slice(0, 50) || undefined,
        paymentCapturedAt: Number.isFinite(Number(payment.created_at)) ? new Date(Number(payment.created_at) * 1000) : undefined,
      };
    } catch (error) {
      // The verified signature remains authoritative. Preserve a successful payment if
      // the optional provider metadata lookup is temporarily unavailable.
      console.warn('Could not retrieve Razorpay payment metadata:', error.message);
    }
    const order = await Order.findOneAndUpdate({ razorpayOrderId: razorpay_order_id, status: 'created' }, { status: 'paid', razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, ...providerPayment }, { new: true });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ success: true, fulfillmentStatus: 'processing' });

    // Delivery is asynchronous so an email-provider failure never invalidates a verified payment.
    void postPaymentActions(order._id).catch((error) => {
      console.error('Payment fulfillment failed:', error.message);
    });

  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);
    res.status(500).json({ message: "Verification failed" });
  }
};
