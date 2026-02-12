const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Order = require("../models/Order");
const sendMail = require("../utils/sendMail");
const PRODUCTS = require("../config/products");
const generateInvoice = require("../utils/generateInvoice");
const postPaymentActions = require("../utils/postPaymentActions");



/* ===============================
   1️⃣ CREATE ORDER
================================ */
exports.createOrder = async (req, res) => {
  try {
    console.log("🔥 CREATE ORDER HIT");
    console.log("👉 BODY:", req.body);

    const { productId, email } = req.body;

    // 🛑 Validate product
    if (!productId || !PRODUCTS[productId]) {
      return res.status(400).json({ message: "Invalid product selected" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const product = PRODUCTS[productId];

    if (!product || !product.price || !product.downloadUrl) {
      return res.status(400).json({ message: "Product not configured properly" });
    }

    const amountInPaise = product.price * 100;

    // 🔁 Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    });

    // 🧾 Save order snapshot in DB
    await Order.create({
      email,
      productId,
      productName: product.name,
      amount: product.price,
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
    console.log("🔐 VERIFY PAYMENT HIT");

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

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: "paid",
        razorpayPaymentId: razorpay_payment_id
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ⚡ RESPOND FAST (IMPORTANT)
    res.json({ success: true });

    // 🔥 Fire-and-forget background task
    process.nextTick(() => {
      postPaymentActions(order);
    });

  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);
    res.status(500).json({ message: "Verification failed" });
  }
};
