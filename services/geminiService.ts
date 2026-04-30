import { RoundtableResponse } from "../types";
import { SYSTEM_PROMPT } from "../shared-constants";

const OPENROUTER_FREE_MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";

const runOpenRouterClientCall = async (model: string, apiKey: string, userInput: string): Promise<RoundtableResponse> => {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
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

  const data = await response.json().catch(() => null) as any;

  if (!response.ok) {
    const message = data?.error?.message || `OpenRouter call failed with status ${response.status}`;
    throw new Error(message);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("OpenRouter response did not include JSON content.");
  }

  return JSON.parse(content) as RoundtableResponse;
};

export const generateRoundtableAnalysis = async (
  userInput: string,
  customApiKey?: string,
  provider: "openrouter" = "openrouter"
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
      console.warn("Server-side analysis unavailable, falling back to client-side OpenRouter call...", e);
    }
  }

  if (provider === "openrouter" && customApiKey) {
    return runOpenRouterClientCall(OPENROUTER_FREE_MODEL, customApiKey, userInput);
  }

  const details = serverFailureReason ? ` ${serverFailureReason}` : "";
  throw new Error(
    `No OpenRouter API key is configured for client fallback.${details} Configure OPENROUTER_API_KEY on the server for the $5 managed session, or add your own OpenRouter API key in settings for the $1 BYO plan.`
  );
};
