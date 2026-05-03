import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  postAnalyze,
  getHistory,
  getAnalysisById,
  postShare,
  getSharePublic,
} from "../controllers/analysis.controller.js";

export const analysisRouter = Router();

const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_WRITE_PER_MIN || 20, 10),
  standardHeaders: true,
  legacyHeaders: false,
});

const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_READ_PER_MIN || 120, 10),
  standardHeaders: true,
  legacyHeaders: false,
});

analysisRouter.post("/analyze", authMiddleware, writeLimiter, asyncHandler(postAnalyze));
analysisRouter.get("/history", authMiddleware, readLimiter, asyncHandler(getHistory));
analysisRouter.get("/analysis/:id", authMiddleware, readLimiter, asyncHandler(getAnalysisById));
analysisRouter.post("/analysis/:id/share", authMiddleware, writeLimiter, asyncHandler(postShare));
analysisRouter.get("/share/:shareId", readLimiter, asyncHandler(getSharePublic));
