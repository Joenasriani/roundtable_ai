
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { SYSTEM_PROMPT } from "./constants";

const app = express();
const PORT = 3000;

app.use(express.json());

// API Routes
app.post("/api/analyze", async (req, res) => {
  const { input } = req.body;
  if (!input) return res.status(400).json({ error: "Input is required" });

  const openRouterKey = process.env.APEX_INNOVATE_API || process.env.OPENROUTER_API_KEY;

  if (openRouterKey) {
    try {
      console.log("Using OpenRouter for analysis...");
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_URL || "https://ai.studio/build",
          "X-Title": "Roundtable AI Pro",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-lite-preview-02-05:free",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: input }
          ],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "OpenRouter call failed");
      
      const content = data.choices[0].message.content;
      res.json(JSON.parse(content));
    } catch (error: any) {
      console.error("OpenRouter Error:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(404).json({ error: "OpenRouter key not found. Using frontend Gemini fallback." });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
