// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   razorpayOrderId: String,
//   razorpayPaymentId: String,
//   razorpaySignature: String,

//   email: String,
//   plan: String,
//   amount: Number,

//   status: {
//     type: String,
//     enum: ['created', 'paid', 'failed'],
//     default: 'created'
//   }
// }, { timestamps: true });

// module.exports = mongoose.model('Order', orderSchema);



const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // Razorpay refs
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    razorpayPaymentId: { type: String, unique: true, sparse: true, index: true },
    razorpaySignature: String,
    paymentMethod: { type: String, trim: true, maxlength: 50, index: true },
    paymentCapturedAt: Date,

    // Customer
    email: {
      type: String,
      required: true
    },

    // Product snapshot (IMPORTANT)
    productId: {
      type: String,
      required: true
    },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    // Immutable sale-time snapshot. It keeps historical revenue reports correct after a product split changes.
    ownerSharePercent: { type: Number, min: 0, max: 100, default: 100 },
    downloadUrl: {
      type: String,
      required: true
    },

    // Order status
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created"
    },
    fulfillmentStatus: { type: String, enum: ['pending', 'processing', 'delivered', 'failed'], default: 'pending' },
    fulfillmentEmailId: { type: String, trim: true, index: true },
    fulfillmentError: { type: String, trim: true, maxlength: 500 },
    fulfillmentAttemptedAt: Date,
    fulfilledAt: Date
  },
  { timestamps: true }
);

orderSchema.index({ email: 1, createdAt: -1 });
orderSchema.index({ status: 1, paymentMethod: 1, createdAt: -1 });
orderSchema.index({ status: 1, productId: 1, createdAt: -1 });
orderSchema.index({ status: 1, paymentCapturedAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
