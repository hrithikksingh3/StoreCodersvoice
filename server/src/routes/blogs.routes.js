const router = require('express').Router(); const c = require('../controllers/blogs.controller'); router.get('/', c.listPublic); router.get('/:slug', c.getPublic); module.exports = router;
