const router = require("express").Router();
const rateLimit = require("express-rate-limit");

const { chatWithAI } = require("../controllers/ai.controller");

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 4,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      reply: "Too many requests. Please wait 60 seconds."
    });
  }
});



router.post("/chat", aiLimiter, chatWithAI);


module.exports = router;
