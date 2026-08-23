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

module.exports = mongoose.model("Order", orderSchema);
