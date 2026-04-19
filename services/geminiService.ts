
import { GoogleGenAI, Type } from "@google/genai";
import { RoundtableResponse } from "../types";
import { SYSTEM_PROMPT } from "../constants";

const EVIDENCE_LABELS = new Set(["Established Fact", "Strong Evidence", "Theoretical Interpretation"]);

const toSafeString = (value: unknown, fallback = "Not provided."): string =>
  typeof value === "string" && value.trim().length > 0 ? value : fallback;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const toScaleOfTen = (value: unknown): number => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  const scaled = numeric <= 1 ? numeric * 10 : numeric;
  return clamp(Math.round(scaled), 0, 10);
};

const toPercent = (value: unknown): number => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  const scaled = numeric <= 1 ? numeric * 100 : numeric;
  return clamp(Math.round(scaled), 0, 100);
};

const normalizeRoundtableResponse = (raw: any): RoundtableResponse => {
  const experts = Array.isArray(raw?.experts)
    ? raw.experts
        .filter((expert: any) => typeof expert?.field === "string")
        .map((expert: any) => ({
          field: toSafeString(expert.field, "Unknown Field"),
          technicalAnalysis: toSafeString(expert.technicalAnalysis),
          plainLanguage: toSafeString(expert.plainLanguage),
          keyClaims: Array.isArray(expert.keyClaims)
            ? expert.keyClaims.map((claim: any) => ({
                text: toSafeString(claim?.text),
                label: EVIDENCE_LABELS.has(claim?.label) ? claim.label : "Strong Evidence",
              }))
            : [],
        }))
    : [];

  return {
    intent: Array.isArray(raw?.intent) ? raw.intent.filter((tag: any) => typeof tag === "string" && tag.trim().length > 0) : [],
    experts,
    debate: {
      agreements: Array.isArray(raw?.debate?.agreements) ? raw.debate.agreements.filter((item: any) => typeof item === "string") : [],
      conflicts: Array.isArray(raw?.debate?.conflicts)
        ? raw.debate.conflicts.map((conflict: any) => ({
            description: toSafeString(conflict?.description),
            evidenceStrength: toScaleOfTen(conflict?.evidenceStrength),
            realWorldImpact: toScaleOfTen(conflict?.realWorldImpact),
            riskIfIncorrect: toScaleOfTen(conflict?.riskIfIncorrect),
          }))
        : [],
      resolution: toSafeString(raw?.debate?.resolution),
      uncertainty: toSafeString(raw?.debate?.uncertainty),
    },
    verdict: {
      coreConclusion: toSafeString(raw?.verdict?.coreConclusion),
      supportingEvidenceSummary: toSafeString(raw?.verdict?.supportingEvidenceSummary),
      economicFeasibility: toSafeString(raw?.verdict?.economicFeasibility),
      ethicalGovernance: toSafeString(raw?.verdict?.ethicalGovernance),
      risksTradeOffs: toSafeString(raw?.verdict?.risksTradeOffs),
      confidenceLevel: toPercent(raw?.verdict?.confidenceLevel),
      failureConditions: toSafeString(raw?.verdict?.failureConditions),
    },
  };
};

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
        const serverData = await serverResponse.json();
        return normalizeRoundtableResponse(serverData);
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
      return normalizeRoundtableResponse(JSON.parse(jsonStr));
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
