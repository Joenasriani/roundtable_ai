import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { SYSTEM_PROMPT } from "./shared-constants";

const app = express();
const PORT = 3000;

app.use(express.json());

const OPENROUTER_DEFAULT_MODEL = process.env.OPENROUTER_DEFAULT_MODEL || "google/gemini-2.0-flash-lite-preview-02-05:free";
const OPENROUTER_FALLBACK_MODEL = process.env.OPENROUTER_FALLBACK_MODEL || "google/gemini-2.0-flash-exp:free";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callOpenRouter = async (apiKey: string, input: string, model: string) => {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_URL || "https://expert-roundtable.vercel.app",
      "X-Title": "Roundtable AI Pro",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: input },
      ],
      response_format: { type: "json_object" },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "OpenRouter call failed");
  }

  return JSON.parse(data.choices[0].message.content);
};

const callWithRetry = async (apiKey: string, input: string, model: string, retries = 2) => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await callOpenRouter(apiKey, input, model);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < retries) {
        await delay(400 * Math.pow(2, attempt));
      }
    }
  }

  throw lastError ?? new Error("OpenRouter call failed");
};

app.post("/api/analyze", async (req, res) => {
  const { input } = req.body;
  if (!input) return res.status(400).json({ error: "Input is required" });
  if (input.length > 5000) return res.status(400).json({ error: "Input exceeds maximum length of 5000 characters." });

  const openRouterKey = process.env.APEX_INNOVATE_API || process.env.OPENROUTER_API_KEY;

  if (!openRouterKey) {
    return res.status(500).json({ error: "OpenRouter key not found." });
  }

  try {
    const primaryResult = await callWithRetry(openRouterKey, input, OPENROUTER_DEFAULT_MODEL);
    return res.json(primaryResult);
  } catch {
    try {
      const fallbackResult = await callWithRetry(openRouterKey, input, OPENROUTER_FALLBACK_MODEL);
      return res.json(fallbackResult);
    } catch (error) {
      const message = error instanceof Error ? error.message : "OpenRouter call failed";
      return res.status(500).json({ error: message });
    }
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0");
}

startServer();
