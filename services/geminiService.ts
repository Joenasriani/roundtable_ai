
import { GoogleGenAI, Type } from "@google/genai";
import { RoundtableResponse } from "../types";
import { SYSTEM_PROMPT } from "../shared-constants";

export const generateRoundtableAnalysis = async (userInput: string, customApiKey?: string): Promise<RoundtableResponse> => {
  // First, try the server-side proxy (which uses OpenRouter if configured)
  // We only skip this if a custom API key is explicitly provided by the user
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
    } catch (e) {
      console.warn("Server-side analysis unavailable, falling back to client-side Gemini...", e);
    }
  }

  // Fallback to client-side Gemini (or use custom key)
  const models = ['gemini-2.0-flash-exp', 'gemini-2.0-flash-lite-preview-02-05', 'gemini-1.5-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const apiKey = customApiKey || (process.env.GEMINI_API_KEY || (process.env as any).API_KEY);
      const ai = new GoogleGenAI({ apiKey: apiKey as string });

      const response = await ai.models.generateContent({
        model: model,
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
                description: "An array of strings representing the classified user intent (e.g., ['Technical', 'Philosophical'])."
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
                          label: { type: Type.STRING, description: "Must be 'Established Fact', 'Strong Evidence', or 'Theoretical Interpretation'" }
                        },
                        required: ["text", "label"]
                      }
                    }
                  },
                  required: ["field", "technicalAnalysis", "plainLanguage", "keyClaims"]
                }
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
                        riskIfIncorrect: { type: Type.NUMBER }
                      },
                      required: ["description", "evidenceStrength", "realWorldImpact", "riskIfIncorrect"]
                    }
                  },
                  resolution: { type: Type.STRING },
                  uncertainty: { type: Type.STRING }
                },
                required: ["agreements", "conflicts", "resolution", "uncertainty"]
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
                  failureConditions: { type: Type.STRING }
                },
                required: ["coreConclusion", "supportingEvidenceSummary", "economicFeasibility", "ethicalGovernance", "risksTradeOffs", "confidenceLevel", "failureConditions"]
              }
            },
            required: ["intent", "experts", "debate", "verdict"]
          }
        }
      });

      const jsonStr = response.text.trim();
      return JSON.parse(jsonStr) as RoundtableResponse;
    } catch (error: any) {
      lastError = error;
      console.warn(`Model ${model} failed, trying next...`, error);
      // If it's an API key error, we should probably stop and let the user know
      if (error?.message?.includes('API key not valid')) {
        throw new Error('API_KEY_INVALID');
      }
      continue;
    }
  }

  console.error("All free models failed:", lastError);
  throw new Error(lastError?.message || "All free reasoning models are currently unavailable.");
};
