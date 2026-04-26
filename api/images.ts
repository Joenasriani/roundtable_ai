import { imagesHandler } from "./analysisHandler";

type Req = { method?: string; body?: Record<string, unknown> };
type Res = { status: (code: number) => Res; json: (body: unknown) => unknown };

export default async function handler(req: Req, res: Res) {
  return imagesHandler(req, res);
}
