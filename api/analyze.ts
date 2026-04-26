import { runOpenRouterAnalysis } from "./openrouter";

type Req = { method?: string; body?: { input?: unknown } };
type Res = { status: (code: number) => Res; json: (body: unknown) => unknown };

export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { input } = req.body ?? {};
  if (!input) return res.status(400).json({ error: "Input is required" });
  if (typeof input !== "string") return res.status(400).json({ error: "Input must be a string." });
  if (input.length > 5000) return res.status(400).json({ error: "Input exceeds maximum length of 5000 characters." });

  try {
    const result = await runOpenRouterAnalysis(input);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
