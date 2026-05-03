import { Router } from "express";
import { chromaHeartbeat } from "../rag/chromaClient.js";
import { connectionState } from "../config/db.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const healthRouter = Router();

healthRouter.get(
  "/",
  asyncHandler(async (req, res) => {
  const mongo = connectionState();
  const chroma = await chromaHeartbeat().catch(() => false);
  res.json({
    ok: true,
    mongo: mongo === 1 ? "connected" : mongo === 2 ? "connecting" : "disconnected",
    chroma: chroma ? "up" : "down_or_skipped",
  });
  }),
);
