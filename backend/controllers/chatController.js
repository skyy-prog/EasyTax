const { GoogleGenerativeAI } = require("@google/generative-ai");

const askGemini = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0 || message.length > 1000) {
      return res.status(400).json({ message: "Invalid message" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(502).json({ message: "Tax assistant is temporarily unavailable" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a helpful Indian tax assistant for small business owners. Answer questions about GST, ITR, TDS, and general tax filing in simple, clear language. Question: ${message}`;

    try {
      const result = await model.generateContent(prompt);
      return res.json({ reply: result.response.text() });
    } catch (error) {
      return res.status(502).json({ message: "Tax assistant is temporarily unavailable. Please try again." });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = { askGemini };
