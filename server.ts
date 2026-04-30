
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { analyzeHandler, audioHandler, videoHandler, imagesHandler } from "./api/analysisHandler";

const app = express();
const PORT = 3000;

app.use(express.json());

// API Routes
app.post("/api/analyze", analyzeHandler);
app.post("/api/text", analyzeHandler);
app.post("/api/audio", audioHandler);
app.post("/api/video", videoHandler);
app.post("/api/images", imagesHandler);
app.post("/analyze", analyzeHandler);

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
