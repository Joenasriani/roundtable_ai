import { SYSTEM_PROMPT } from "../constants";

type RequestLike = { method?: string; body?: unknown };
type ResponseLike = { status: (code: number) => { json: (body: unknown) => unknown } };

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { input } = (req.body as { input?: string }) ?? {};
  if (!input || typeof input !== "string") {
    return res.status(400).json({ error: "Input is required" });
  }

  const openRouterKey = process.env.ROUNDTABLE_API || process.env.OPENROUTER_API_KEY;

  if (!openRouterKey) {
    return res.status(404).json({ error: "ROUNDTABLE_API not configured. Using client-side fallback." });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "https://roundtable-ai.vercel.app",
        "X-Title": "Roundtable AI Pro",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-lite-preview-02-05:free",
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
    if (!content) {
      throw new Error("OpenRouter returned an empty response");
    }

    return res.status(200).json(JSON.parse(content));
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || "Unknown server error" });
  }
}
