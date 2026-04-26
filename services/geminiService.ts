import { RoundtableResponse } from "../types";
import { SYSTEM_PROMPT } from "../shared-constants";

const GEMINI_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    intent: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "An array of strings representing classified user intent."
    },
    experts: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          field: { type: "STRING" },
          technicalAnalysis: { type: "STRING" },
          plainLanguage: { type: "STRING" },
          keyClaims: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                text: { type: "STRING" },
                label: { type: "STRING" }
              },
              required: ["text", "label"]
            }
          }
        },
        required: ["field", "technicalAnalysis", "plainLanguage", "keyClaims"]
      }
    },
    debate: {
      type: "OBJECT",
      properties: {
        agreements: { type: "ARRAY", items: { type: "STRING" } },
        conflicts: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              description: { type: "STRING" },
              evidenceStrength: { type: "NUMBER" },
              realWorldImpact: { type: "NUMBER" },
              riskIfIncorrect: { type: "NUMBER" }
            },
            required: ["description", "evidenceStrength", "realWorldImpact", "riskIfIncorrect"]
          }
        },
        resolution: { type: "STRING" },
        uncertainty: { type: "STRING" }
      },
      required: ["agreements", "conflicts", "resolution", "uncertainty"]
    },
    verdict: {
      type: "OBJECT",
      properties: {
        coreConclusion: { type: "STRING" },
        supportingEvidenceSummary: { type: "STRING" },
        economicFeasibility: { type: "STRING" },
        ethicalGovernance: { type: "STRING" },
        risksTradeOffs: { type: "STRING" },
        confidenceLevel: { type: "NUMBER" },
        failureConditions: { type: "STRING" }
      },
      required: ["coreConclusion", "supportingEvidenceSummary", "economicFeasibility", "ethicalGovernance", "risksTradeOffs", "confidenceLevel", "failureConditions"]
    }
  },
  required: ["intent", "experts", "debate", "verdict"]
} as const;

const generateGeminiContent = async (model: string, apiKey: string, userInput: string): Promise<RoundtableResponse> => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: [{ role: "user", parts: [{ text: userInput }] }],
      tools: [{ googleSearch: {} }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: GEMINI_RESPONSE_SCHEMA
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || `Gemini call failed with status ${response.status}`;
    throw new Error(message);
  }

  const rawText = data?.candidates?.[0]?.content?.parts?.find((part: { text?: string }) => typeof part.text === "string")?.text;
  if (!rawText) {
    throw new Error("Gemini response did not include JSON content.");
  }

  return JSON.parse(rawText) as RoundtableResponse;
};

export const generateRoundtableAnalysis = async (
  userInput: string,
  customApiKey?: string,
  provider: "gemini" | "openrouter" = "gemini"
): Promise<RoundtableResponse> => {
  let serverFailureReason: string | null = null;

  if (!customApiKey) {
    try {
      const serverResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: userInput }),
      });

      if (serverResponse.ok) {
        return await serverResponse.json();
      }

      const errorPayload = await serverResponse.json().catch(() => null);
      const serverError = errorPayload?.error || `HTTP ${serverResponse.status}`;
      serverFailureReason = `Server-side analysis failed (${serverError}).`;
    } catch (e) {
      serverFailureReason = "Server-side analysis endpoint is unreachable.";
      console.warn("Server-side analysis unavailable, falling back to client-side logic...", e);
    }
  }

  if (provider === "openrouter" && customApiKey) {
    const defaultModel = process.env.OPENROUTER_DEFAULT_MODEL || "openrouter/free";
    const fallbackModel = process.env.OPENROUTER_FALLBACK_MODEL || "openrouter/free";
    const modelsToTry = [...new Set([defaultModel, fallbackModel])];

    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${customApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userInput }
          ],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      if (response.ok) {
        return JSON.parse(data.choices[0].message.content) as RoundtableResponse;
      }

      lastError = new Error(data.error?.message || `OpenRouter call failed for model ${model}`);
    }

    throw lastError || new Error("OpenRouter call failed");
  }

  const models = ["gemini-2.0-flash-exp", "gemini-2.0-flash-lite-preview-02-05", "gemini-1.5-flash"];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const apiKey = customApiKey || (process.env.GEMINI_API_KEY || (process.env as any).API_KEY);
      if (!apiKey) {
        const details = serverFailureReason ? ` ${serverFailureReason}` : "";
        throw new Error(
          `No client-side Gemini API key is configured.${details} Configure OPENROUTER_API_KEY on the server (e.g. Vercel env vars) or add your own API key in settings.`
        );
      }

      return await generateGeminiContent(model, apiKey as string, userInput);
    } catch (error: any) {
      const errMessage = error?.message || "Gemini call failed";
      lastError = new Error(errMessage);
      console.warn(`Model ${model} failed, trying next...`, error);
      if (errMessage.includes("API key not valid") || errMessage.includes("API_KEY_INVALID")) {
        throw new Error("API_KEY_INVALID");
      }
    }
  }

  throw new Error(lastError?.message || "All free reasoning models are currently unavailable.");
};
