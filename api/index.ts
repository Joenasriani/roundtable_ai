import express from "express";
import { runOpenRouterAnalysis } from "./openrouter";

const app = express();
app.use(express.json());

const analyzeHandler = async (req: express.Request, res: express.Response) => {
  const { input } = req.body;
  if (!input) return res.status(400).json({ error: "Input is required" });
  if (input.length > 5000) return res.status(400).json({ error: "Input exceeds maximum length of 5000 characters." });

  try {
    const result = await runOpenRouterAnalysis(input);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

app.post("/api/analyze", analyzeHandler);
app.post("/analyze", analyzeHandler);
app.post("/", analyzeHandler);

export default app;
