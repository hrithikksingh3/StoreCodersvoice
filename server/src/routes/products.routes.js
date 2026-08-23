const router = require('express').Router(); const c = require('../controllers/products.controller');
router.get('/', c.listPublic); router.get('/:slug', c.getPublic);
module.exports = router;
