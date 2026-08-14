const getGeminiModel = () => process.env.GEMINI_MODEL || "gemini-flash-latest";

const extractGeminiText = (data) =>
  data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join("")
    .trim();

const askGemini = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0 || message.length > 1000) {
      return res.status(400).json({ message: "Invalid message" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(502).json({ message: "Tax assistant is temporarily unavailable" });
    }

    const prompt = `You are a helpful Indian tax assistant for small business owners. Answer questions about GST, ITR, TDS, and general tax filing in simple, clear language. Question: ${message}`;

    try {
      const model = getGeminiModel();
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
          process.env.GEMINI_API_KEY
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Gemini API error:", {
          status: response.status,
          message: data?.error?.message,
        });
        return res.status(502).json({ message: "Tax assistant is temporarily unavailable. Please try again." });
      }

      const reply = extractGeminiText(data);

      if (!reply) {
        console.error("Gemini API returned an empty response");
        return res.status(502).json({ message: "Tax assistant is temporarily unavailable. Please try again." });
      }

      return res.json({ reply });
    } catch (error) {
      console.error("Gemini request failed:", error.message);
      return res.status(502).json({ message: "Tax assistant is temporarily unavailable. Please try again." });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = { askGemini };
