const getGeminiModel = () => process.env.GEMINI_MODEL || "gemini-flash-latest";

const extractGeminiText = (data) =>
  data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join("")
    .trim();

const askGeminiModel = async (prompt) => {
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
    throw new Error("Gemini API request failed");
  }

  const reply = extractGeminiText(data);

  if (!reply) {
    console.error("Gemini API returned an empty response");
    throw new Error("Gemini API returned an empty response");
  }

  return reply;
};

const extractJsonObject = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    return null;
  }

  try {
    return JSON.parse(match[0]);
  } catch (error) {
    return null;
  }
};

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

const buildFallbackHealthCheck = ({ summary, sales }) => {
  const totalSales = Number(summary?.totalSales || 0);
  const gstCollected = Number(summary?.gstCollected || 0);
  const totalExpenses = Number(summary?.totalExpenses || 0);
  const netProfit = Number(summary?.netProfit || 0);
  const salesCount = sales.length;
  const expenseRatio = totalSales > 0 ? totalExpenses / totalSales : 0;
  const gstRatio = totalSales > 0 ? gstCollected / totalSales : 0;
  const profitMargin = totalSales > 0 ? netProfit / totalSales : 0;

  let score = 86;
  if (totalSales === 0) score -= 30;
  if (profitMargin < 0.15) score -= 18;
  if (expenseRatio > 0.45) score -= 14;
  if (gstRatio > 0.2) score -= 8;
  if (salesCount < 3) score -= 6;

  const risks = [];
  if (totalSales === 0) {
    risks.push("No sales are recorded today, so GST and profit visibility is weak.");
  }
  if (expenseRatio > 0.45) {
    risks.push("Expenses are consuming a high share of today's revenue.");
  }
  if (profitMargin < 0.15 && totalSales > 0) {
    risks.push("Net profit margin is thin and may need pricing or cost review.");
  }
  if (gstRatio > 0.2) {
    risks.push("GST collected looks high compared with sales; verify product GST slabs.");
  }

  return {
    score: clampScore(score),
    verdict:
      score >= 80
        ? "Healthy day with a few checks worth tightening."
        : "Needs attention before closing today's books.",
    risks: risks.length ? risks.slice(0, 3) : ["No major risk detected from today's available records."],
    opportunities: [
      salesCount > 0
        ? `Review ${salesCount} sale${salesCount === 1 ? "" : "s"} for invoice completeness before filing.`
        : "Record sales as they happen so the assistant can detect GST and margin trends.",
      expenseRatio > 0.3
        ? "Split large expenses by category to make deductions and cash leakages easier to defend."
        : "Keep expense entries categorized daily to make month-end reporting interview-ready.",
      "Use this summary as a daily close checklist for GST, cash flow, and profitability.",
    ],
    nextActions: [
      "Generate today's summary after entering all sales and expenses.",
      "Check GST slabs for the highest-value products sold today.",
      "Export or save invoice evidence for any unusually large transaction.",
    ],
    confidence: process.env.GEMINI_API_KEY ? "medium" : "rule-based",
  };
};

const askGemini = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0 || message.length > 1000) {
      return res.status(400).json({ message: "Invalid message" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(502).json({ message: "Tax assistant is temporarily unavailable" });
    }

    const prompt = `You are a helpful Indian tax assistant for small business owners.
Answer questions about GST, ITR, TDS, and general tax filing in simple, clear language.
Format every answer cleanly for a chat UI:
- Start with a short direct answer.
- Use short paragraphs.
- Use bullet points for steps, conditions, and checklists.
- Use **bold** only for important tax terms, due dates, limits, and section names.
- Do not end with generic phrases like "feel free to ask".
- Add a brief caution when the answer depends on invoice details, business type, or law changes.

Question: ${message}`;

    try {
      const reply = await askGeminiModel(prompt);
      return res.json({ reply });
    } catch (error) {
      console.error("Gemini request failed:", error.message);
      return res.status(502).json({ message: "Tax assistant is temporarily unavailable. Please try again." });
    }
  } catch (error) {
    return next(error);
  }
};

const getHealthCheck = async (req, res, next) => {
  try {
    const summary = req.body?.summary || {};
    const sales = Array.isArray(req.body?.sales) ? req.body.sales.slice(0, 20) : [];
    const fallback = buildFallbackHealthCheck({ summary, sales });

    if (!process.env.GEMINI_API_KEY) {
      return res.json(fallback);
    }

    const prompt = `You are EasyTax AI, an Indian GST and small-business finance copilot.
Analyze today's business snapshot and return ONLY valid JSON with this exact shape:
{
  "score": number from 0 to 100,
  "verdict": "one impressive sentence under 120 characters",
  "risks": ["max 3 concise risk bullets"],
  "opportunities": ["max 3 concise opportunity bullets"],
  "nextActions": ["max 3 specific actions for today"],
  "confidence": "high" | "medium" | "low"
}

Use practical language for a shop owner. Consider GST, expenses, profit margin, missing data, and invoice hygiene.
Do not invent laws, due dates, or exact tax liability.

Snapshot:
${JSON.stringify({ summary, sales }, null, 2)}`;

    try {
      const reply = await askGeminiModel(prompt);
      const parsed = extractJsonObject(reply);

      if (!parsed) {
        return res.json(fallback);
      }

      return res.json({
        score: clampScore(parsed.score),
        verdict: String(parsed.verdict || fallback.verdict).slice(0, 140),
        risks: Array.isArray(parsed.risks) && parsed.risks.length ? parsed.risks.slice(0, 3) : fallback.risks,
        opportunities:
          Array.isArray(parsed.opportunities) && parsed.opportunities.length
            ? parsed.opportunities.slice(0, 3)
            : fallback.opportunities,
        nextActions:
          Array.isArray(parsed.nextActions) && parsed.nextActions.length
            ? parsed.nextActions.slice(0, 3)
            : fallback.nextActions,
        confidence: ["high", "medium", "low"].includes(parsed.confidence) ? parsed.confidence : "medium",
      });
    } catch (error) {
      console.error("Gemini health check failed:", error.message);
      return res.json(fallback);
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = { askGemini, getHealthCheck };
