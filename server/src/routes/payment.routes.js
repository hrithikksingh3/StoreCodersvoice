const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { createOrder, verifyPayment } = require('../controllers/payment.controller');

const paymentLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many payment requests. Please try again later.' } });
router.post('/create-order', paymentLimiter, createOrder);
router.post('/verify', paymentLimiter, verifyPayment);

module.exports = router;
