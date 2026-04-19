import { SYSTEM_PROMPT } from "../constants";

const OPENROUTER_MODEL = "google/gemini-2.0-flash-lite-preview-02-05:free";
const DEFAULT_APP_URL = "https://ai.studio/build";

const parseBody = (body: unknown): any => {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { input } = parseBody(req.body);
  if (!input || typeof input !== "string") {
    return res.status(400).json({ error: "Input is required" });
  }

  const openRouterKey = process.env.APEX_INNOVATE_API || process.env.OPENROUTER_API_KEY;
  if (!openRouterKey) {
    return res.status(503).json({ error: "OpenRouter key not found. Using frontend Gemini fallback." });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || DEFAULT_APP_URL,
        "X-Title": "Roundtable AI Pro",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || OPENROUTER_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: input },
        ],
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || "OpenRouter call failed");
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("Invalid OpenRouter response content");
    }

    return res.status(200).json(JSON.parse(content));
  } catch (error: any) {
    console.error("Vercel /api/analyze error:", error);
    return res.status(500).json({ error: error?.message || "Unexpected server error" });
  }
}
