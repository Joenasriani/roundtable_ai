import { runOpenRouterAnalysis } from "./openrouter";

type ReqLike = { method?: string; body?: Record<string, unknown> };
type ResLike = { status: (code: number) => ResLike; json: (body: unknown) => unknown };

const MAX_INPUT_LENGTH = 5000;

const parseString = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

const extractInputByModule = (moduleName: string, body: Record<string, unknown> = {}): string => {
  const directInput = parseString(body.input);
  if (directInput) return directInput;

  switch (moduleName) {
    case "audio": {
      const transcript = parseString(body.transcript);
      const context = parseString(body.context);
      if (!transcript) return "";
      return context ? `Audio transcript:\n${transcript}\n\nAdditional context:\n${context}` : `Audio transcript:\n${transcript}`;
    }
    case "video": {
      const transcript = parseString(body.transcript);
      const sceneDescription = parseString(body.sceneDescription);
      const context = parseString(body.context);
      const parts = [
        transcript ? `Video transcript:\n${transcript}` : "",
        sceneDescription ? `Visual scene description:\n${sceneDescription}` : "",
        context ? `Additional context:\n${context}` : "",
      ].filter(Boolean);
      return parts.join("\n\n");
    }
    case "images": {
      const imageDescription = parseString(body.imageDescription);
      const ocrText = parseString(body.ocrText);
      const context = parseString(body.context);
      const parts = [
        imageDescription ? `Image description:\n${imageDescription}` : "",
        ocrText ? `Extracted text:\n${ocrText}` : "",
        context ? `Additional context:\n${context}` : "",
      ].filter(Boolean);
      return parts.join("\n\n");
    }
    default:
      return "";
  }
};

export const createModuleHandler = (moduleName: "text" | "audio" | "video" | "images") => {
  return async (req: ReqLike, res: ResLike) => {
    if (req.method && req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const input = extractInputByModule(moduleName, req.body ?? {});
    if (!input) {
      return res.status(400).json({
        error:
          moduleName === "text"
            ? "Input is required"
            : `No analyzable content found for ${moduleName} module.`,
      });
    }

    if (input.length > MAX_INPUT_LENGTH) {
      return res.status(400).json({
        error: `Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters.`,
      });
    }

    try {
      const result = await runOpenRouterAnalysis(input);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Analysis failed", error);
      return res.status(402).json({
        error: "PAYMENT_REQUIRED",
        paymentRequired: true,
        message: "This analysis requires an active session.",
      });
    }
  };
};

export const analyzeHandler = createModuleHandler("text");
export const audioHandler = createModuleHandler("audio");
export const videoHandler = createModuleHandler("video");
export const imagesHandler = createModuleHandler("images");
