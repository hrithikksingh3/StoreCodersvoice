const router = require('express').Router();
const { subscribe } = require('../controllers/newsletter.controller');

router.post('/', subscribe);

module.exports = router;
