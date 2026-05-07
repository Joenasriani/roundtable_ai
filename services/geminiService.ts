import { RoundtableResponse } from "../types";
import { SYSTEM_PROMPT } from "../shared-constants";

const OPENROUTER_FREE_MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";
export const PAYMENT_REQUIRED_ERROR = "PAYMENT_REQUIRED";

export class PaymentRequiredError extends Error {
  constructor(message = "This analysis requires an active session. Please continue through PayPal.") {
    super(message);
    this.name = PAYMENT_REQUIRED_ERROR;
  }
}

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
    console.error("Client analysis failed", { status: response.status, message: data?.error?.message });
    throw new PaymentRequiredError();
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Analysis failed. Please try again.");
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

      const errorPayload = await serverResponse.json().catch(() => null) as any;
      if (serverResponse.status === 402 || errorPayload?.paymentRequired || errorPayload?.error === PAYMENT_REQUIRED_ERROR) {
        throw new PaymentRequiredError(errorPayload?.message);
      }

      serverFailureReason = `Server-side analysis failed (${serverResponse.status}).`;
    } catch (e) {
      if (e instanceof PaymentRequiredError) {
        throw e;
      }
      serverFailureReason = "Server-side analysis endpoint is unreachable.";
      console.warn("Server-side analysis unavailable, falling back to client-side analysis call...", e);
    }
  }

  if (provider === "openrouter" && customApiKey) {
    return runOpenRouterClientCall(OPENROUTER_FREE_MODEL, customApiKey, userInput);
  }

  console.error("Managed analysis unavailable", serverFailureReason);
  throw new PaymentRequiredError();
};
