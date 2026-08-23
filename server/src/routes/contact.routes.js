const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { submitContact } = require('../controllers/contact.controller');

router.post('/', rateLimit({ windowMs: 60 * 60 * 1000, max: 8, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many messages. Please try later.' } }), submitContact);

module.exports = router;
