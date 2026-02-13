const router = require("express").Router();
const { chatWithAI } = require("../controllers/ai.controller");

router.post("/chat", chatWithAI);

module.exports = router;
