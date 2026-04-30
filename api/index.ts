import express from "express";
import { analyzeHandler, audioHandler, videoHandler, imagesHandler } from "./analysisHandler";

const app = express();
app.use(express.json());

app.post("/api/analyze", analyzeHandler);
app.post("/api/text", analyzeHandler);
app.post("/api/audio", audioHandler);
app.post("/api/video", videoHandler);
app.post("/api/images", imagesHandler);
app.post("/analyze", analyzeHandler);
app.post("/", analyzeHandler);

export default app;
