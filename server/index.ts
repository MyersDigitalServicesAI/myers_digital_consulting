import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createWebhookRouter } from "./webhooks/index.ts";
import { startScheduler } from "./scheduler/index.ts";
import { createPortalRouter } from "./routes/portal.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "10mb" })); // large limit for transcripts

  // AIOS webhook endpoints
  app.use("/webhooks", createWebhookRouter());

  // AIOS Client Portal API
  app.use("/api/portal", createPortalRouter());

  // Health check
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      aios: "running",
      anthropic: process.env.ANTHROPIC_API_KEY ? "configured" : "missing",
      notion: process.env.NOTION_API_KEY ? "configured" : "missing",
    });
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Client-side routing fallback (app.use avoids path-to-regexp wildcard syntax)
  app.use((_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`\n🚀 Myers Digital AIOS running on http://localhost:${port}/`);
    console.log(`   Webhooks: http://localhost:${port}/webhooks/`);
    console.log(`   Health:   http://localhost:${port}/health\n`);
  });

  // Start the AIOS scheduler (cron jobs for daily/weekly automations)
  if (process.env.AIOS_SCHEDULER !== "disabled") {
    startScheduler();
  }
}

startServer().catch(console.error);
