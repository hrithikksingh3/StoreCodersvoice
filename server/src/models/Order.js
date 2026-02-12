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
      index: true
    },
    razorpayPaymentId: String,
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
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
