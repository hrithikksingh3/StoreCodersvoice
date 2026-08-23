const Razorpay = require('razorpay');

module.exports = () => {
  if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) throw new Error('Payment service is not configured');
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY, key_secret: process.env.RAZORPAY_SECRET });
};
