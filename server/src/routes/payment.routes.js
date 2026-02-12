const router = require('express').Router();
const { createOrder, verifyPayment } = require('../controllers/payment.controller');

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

module.exports = router;
