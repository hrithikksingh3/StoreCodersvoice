const axios = require("axios");
const Product = require('../models/Product');

let aiRequestCount = 0;
let aiWindowStart = Date.now();
let googleCooldownUntil = 0;

//nonesense detection
function isLowQualityInput(message) {
  const text = message.trim();

  // Only special characters
  if (!/[a-zA-Z0-9]/.test(text)) return true;

  // Random keyboard smash like "asdkj"
  if (
    /^[a-z]{4,}$/i.test(text) &&
    !text.includes("hi") &&
    !text.includes("hey")
  ) {
    return true;
  }

  return false;
}

//local faqs ai
async function handleStoreQuery(message) {
  const text = message.toLowerCase();
  const products = await Product.find({ status: 'published' }, 'name slug price category tags').lean();

 // 🔹 Smart fuzzy product matching
const matched = products.filter(product => {
  const nameWords = product.name.toLowerCase().split(" ");
  const idWords = product.slug.toLowerCase().split("-");

  return [...nameWords, ...idWords].some(word =>
    text.includes(word)
  );
});

if (matched.length > 0) {
  return {
    type: "product_recommendation",
    message: "This project matches your interest 👇",
    products: matched.map(p => ({
      name: p.name,
      slug: p.slug,
      price: p.price
    }))
  };
}


  // 🔹 Greetings
  if (
    text === "hi" ||
    text === "hello" ||
    text === "hey" ||
    text === "hii" ||
    text.includes("good morning") ||
    text.includes("good evening")
  ) {
    return "Hey 👋 Welcome to CodersVoice! How can I help you today?";
  }

  if (text.includes("codersvoice")) {
    return "CodersVoice is a digital marketplace for developers, students, and creators where you can buy ready-made projects and templates to accelerate your growth.";
  }

  if (text.includes("price") || text.includes("cost") || text.includes("free")) {
    return "Our products are priced affordably. You can check individual pricing inside the marketplace.";
  }

  if (text.includes("refund")) {
    return "Most digital products do not include refunds. Please check the product page or contact support for assistance.";
  }

  if (text.includes("project") || text.includes("template")) {
    return "We offer ready-made full-stack projects and templates designed to save time and boost productivity.";
  }

  if (text.includes("buy") || text.includes("purchase")) {
    return "You can securely purchase products from our marketplace. After purchase, access is sent instantly to your email.";
  }

  if (text.includes("lifetime") || text.includes("access")) {
    return "Most products include lifetime access. Please review product details for exact terms.";
  }

  if (
    text.includes("setup") ||
    text.includes("installation") ||
    text.includes("guide")
  ) {
    return "Each product includes a detailed setup guide to help you run it smoothly.";
  }

  if (
    text.includes("promotion") ||
    text.includes("promote") ||
    text.includes("advertise")
  ) {
    return "Yes, we offer paid promotions to help you reach developers and tech learners.";
  }

  if (
    text.includes("support") ||
    text.includes("wrong email") ||
    text.includes("payment issue")
  ) {
    return "If you entered the wrong email during payment, contact support with payment details and we’ll fix it.";
  }

  return null;
}



exports.chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (typeof message !== 'string' || message.trim().length > 1000 || (history && (!Array.isArray(history) || history.length > 8))) return res.status(400).json({ reply: 'Please send a short valid message.' });

    if (isLowQualityInput(message)) {
      return res.json({
        reply:
          "Could you please clarify your question so I can help you better?",
      });
    }

    const storeReply = await handleStoreQuery(message);

  if (storeReply) {
  if (typeof storeReply === "object") {
    return res.json(storeReply);
  }
  return res.json({ reply: storeReply });
}


    if (Date.now() < googleCooldownUntil) {
      return res.status(429).json({
        reply: "AI is cooling down. Please wait a few seconds.",
      });
    }

    // Reset window every 60 seconds
    if (Date.now() - aiWindowStart > 60000) {
      aiWindowStart = Date.now();
      aiRequestCount = 0;
    }

    // Limit to 4 AI calls per minute
    if (aiRequestCount >= 4) {
      return res.status(429).json({
        reply: "AI usage limit reached. Please wait a minute.",
      });
    }

    aiRequestCount++;
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          ...(history || []).map((msg) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }],
          })),
          {
            role: "user",
            parts: [{ text: message }],
          },
        ],
      }, { timeout: 12000 },
    );

    const reply = response.data.candidates[0].content.parts[0].text;

    res.json({ reply });
  } catch (error) {
    const err = error.response?.data;

    if (err?.error?.code === 429) {
      // Extract retry seconds from Google's message
      const retryMatch = err.error.message.match(/retry in (\d+(\.\d+)?)s/i);

      const retrySeconds = retryMatch
        ? Math.ceil(parseFloat(retryMatch[1]))
        : 60;

      googleCooldownUntil = Date.now() + retrySeconds * 1000;

      return res.status(429).json({
        reply: `AI is cooling down. Try again in ${retrySeconds} seconds.`,
      });
    }

    console.error("FULL ERROR:", err || error);
    res.status(500).json({ reply: "Something went wrong" });
  }
};
