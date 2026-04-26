
import express from "express";
import { SYSTEM_PROMPT } from "../shared-constants";

const app = express();
app.use(express.json());

// API Routes
app.post("/api/analyze", async (req, res) => {
  const { input } = req.body;
  if (!input) return res.status(400).json({ error: "Input is required" });
  if (input.length > 5000) return res.status(400).json({ error: "Input exceeds maximum length of 5000 characters." });

  const openRouterKey = process.env.APEX_INNOVATE_API || process.env.OPENROUTER_API_KEY;
  const defaultModel = process.env.OPENROUTER_DEFAULT_MODEL || "openrouter/free";
  const fallbackModel = process.env.OPENROUTER_FALLBACK_MODEL || "openrouter/free";
  const modelsToTry = [...new Set([defaultModel, fallbackModel])];

  if (openRouterKey) {
    try {
      let lastError: Error | null = null;

      for (const model of modelsToTry) {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.APP_URL || "https://expert-roundtable.vercel.app",
            "X-Title": "Roundtable AI Pro",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: input }
            ],
            response_format: { type: "json_object" }
          })
        });

        const data = await response.json();
        if (response.ok) {
          const content = data.choices[0].message.content;
          return res.json(JSON.parse(content));
        }

        lastError = new Error(data.error?.message || `OpenRouter call failed for model ${model}`);
      }

      throw lastError || new Error("OpenRouter call failed");
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(404).json({ error: "OpenRouter key not found. No server-side model is configured." });
  }
});

// For Vercel, we export the app
export default app;
