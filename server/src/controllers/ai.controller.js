const { GoogleGenerativeAI } = require("@google/generative-ai");
const products = require("../config/products");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.0-pro",
    });

    const systemPrompt = `
You are CodersVoice AI Assistant.

Your role:
- Recommend best products.
- Compare products.
- Explain tech stacks.
- Help with checkout.
- Upsell custom development.
- Encourage contact form if needed.

Available products:
${JSON.stringify(products, null, 2)}

Be:
- Confident
- Helpful
- Short but persuasive
- Slightly modern tone
`;

    const result = await model.generateContent(
      systemPrompt + "\nUser: " + message
    );

    const response = result.response.text();

    res.json({ reply: response });
  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({ reply: "AI is currently unavailable." });
  }
};
