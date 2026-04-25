import { GoogleGenAI, Type } from "@google/genai";
import { RoundtableResponse } from "../types";
import { SYSTEM_PROMPT } from "../shared-constants";

const OPENROUTER_DEFAULT_MODEL = process.env.OPENROUTER_DEFAULT_MODEL || "google/gemini-2.0-flash-lite-preview-02-05:free";
const OPENROUTER_FALLBACK_MODEL = process.env.OPENROUTER_FALLBACK_MODEL || "google/gemini-2.0-flash-exp:free";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const postJsonWithRetry = async <T>(
  url: string,
  init: RequestInit,
  retries = 2,
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, init);
      const data = await response.json();

      if (!response.ok) {
        const message = data?.error?.message || data?.error || `Request failed with status ${response.status}`;
        throw new Error(message);
      }

      return data as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < retries) {
        await delay(400 * Math.pow(2, attempt));
      }
    }
  }

  throw lastError ?? new Error("Request failed");
};

export const generateRoundtableAnalysis = async (
  userInput: string,
  customApiKey?: string,
  provider: "gemini" | "openrouter" = "gemini",
): Promise<RoundtableResponse> => {
  if (!customApiKey) {
    try {
      return await postJsonWithRetry<RoundtableResponse>("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: userInput }),
      });
    } catch {
      // Continue to provider-level fallback.
    }
  }

  if (provider === "openrouter" && customApiKey) {
    type OpenRouterResponse = {
      choices: Array<{ message: { content: string } }>;
    };

    const runOpenRouter = async (model: string) => {
      const data = await postJsonWithRetry<OpenRouterResponse>("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userInput },
          ],
          response_format: { type: "json_object" },
        }),
      });

      return JSON.parse(data.choices[0].message.content) as RoundtableResponse;
    };

    try {
      return await runOpenRouter(OPENROUTER_DEFAULT_MODEL);
    } catch {
      return runOpenRouter(OPENROUTER_FALLBACK_MODEL);
    }
  }

  const models = ["gemini-2.0-flash-exp", "gemini-2.0-flash-lite-preview-02-05", "gemini-1.5-flash"];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const apiKey = customApiKey || process.env.GEMINI_API_KEY || (process.env as any).API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey as string });

      const response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: userInput }] }],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intent: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of strings representing the classified user intent (e.g., ['Technical', 'Philosophical']).",
              },
              experts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    field: { type: Type.STRING },
                    technicalAnalysis: { type: Type.STRING },
                    plainLanguage: { type: Type.STRING },
                    keyClaims: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          text: { type: Type.STRING },
                          label: { type: Type.STRING, description: "Must be 'Established Fact', 'Strong Evidence', or 'Theoretical Interpretation'" },
                        },
                        required: ["text", "label"],
                      },
                    },
                  },
                  required: ["field", "technicalAnalysis", "plainLanguage", "keyClaims"],
                },
              },
              debate: {
                type: Type.OBJECT,
                properties: {
                  agreements: { type: Type.ARRAY, items: { type: Type.STRING } },
                  conflicts: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        description: { type: Type.STRING },
                        evidenceStrength: { type: Type.NUMBER },
                        realWorldImpact: { type: Type.NUMBER },
                        riskIfIncorrect: { type: Type.NUMBER },
                      },
                      required: ["description", "evidenceStrength", "realWorldImpact", "riskIfIncorrect"],
                    },
                  },
                  resolution: { type: Type.STRING },
                  uncertainty: { type: Type.STRING },
                },
                required: ["agreements", "conflicts", "resolution", "uncertainty"],
              },
              verdict: {
                type: Type.OBJECT,
                properties: {
                  coreConclusion: { type: Type.STRING },
                  supportingEvidenceSummary: { type: Type.STRING },
                  economicFeasibility: { type: Type.STRING },
                  ethicalGovernance: { type: Type.STRING },
                  risksTradeOffs: { type: Type.STRING },
                  confidenceLevel: { type: Type.NUMBER },
                  failureConditions: { type: Type.STRING },
                },
                required: [
                  "coreConclusion",
                  "supportingEvidenceSummary",
                  "economicFeasibility",
                  "ethicalGovernance",
                  "risksTradeOffs",
                  "confidenceLevel",
                  "failureConditions",
                ],
              },
            },
            required: ["intent", "experts", "debate", "verdict"],
          },
        },
      });

      return JSON.parse(response.text.trim()) as RoundtableResponse;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (lastError.message.includes("API key not valid")) {
        throw new Error("API_KEY_INVALID");
      }
      continue;
    }
  }

  throw new Error(lastError?.message || "All reasoning models are currently unavailable.");
};
