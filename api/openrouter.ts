import { SYSTEM_PROMPT } from "../shared-constants";

type AnalyzeResult = Record<string, unknown>;

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getOpenRouterConfig = () => {
  const apiKey = process.env.APEX_INNOVATE_API || process.env.OPENROUTER_API_KEY;
  const defaultModel = process.env.OPENROUTER_DEFAULT_MODEL || process.env.AI_MODEL || process.env.TEXT_MODEL || "openrouter/free";
  const fallbackModel = process.env.OPENROUTER_FALLBACK_MODEL || process.env.RESEARCH_MODEL || defaultModel;
  const baseUrl = (process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/$/, "");
  const timeoutMs = parsePositiveInt(process.env.OPENROUTER_TIMEOUT_MS, 45000);

  return {
    apiKey,
    modelsToTry: [...new Set([defaultModel, fallbackModel])],
    baseUrl,
    timeoutMs,
    appUrl: process.env.APP_URL || "https://expert-roundtable.vercel.app",
  };
};

export const runOpenRouterAnalysis = async (input: string): Promise<AnalyzeResult> => {
  const { apiKey, modelsToTry, baseUrl, timeoutMs, appUrl } = getOpenRouterConfig();

  if (!apiKey) {
    throw new Error(
      "OpenRouter key not found. Set OPENROUTER_API_KEY (or APEX_INNOVATE_API) in your deployment environment."
    );
  }

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": appUrl,
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
      signal: AbortSignal.timeout(timeoutMs),
    });

    const payload = await response.json().catch(() => null) as any;

    if (response.ok) {
      const content = payload?.choices?.[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new Error(`OpenRouter returned an unexpected response format for model ${model}.`);
      }
      return JSON.parse(content) as AnalyzeResult;
    }

    const details = payload?.error?.message || `OpenRouter call failed for model ${model} (${response.status})`;
    lastError = new Error(details);
  }

  throw lastError || new Error("OpenRouter call failed.");
};
