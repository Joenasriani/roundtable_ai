
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { runOpenRouterAnalysis } from "./api/openrouter";

const app = express();
const PORT = 3000;

app.use(express.json());

const analyzeHandler = async (req: express.Request, res: express.Response) => {
  const { input } = req.body;
  if (!input) return res.status(400).json({ error: "Input is required" });
  if (input.length > 5000) return res.status(400).json({ error: "Input exceeds maximum length of 5000 characters." });

  try {
    console.log("Using OpenRouter for analysis...");
    const result = await runOpenRouterAnalysis(input);
    res.json(result);
  } catch (error: any) {
    console.error("OpenRouter Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// API Routes
app.post("/api/analyze", analyzeHandler);
app.post("/analyze", analyzeHandler);

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
