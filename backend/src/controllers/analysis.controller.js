import mongoose from "mongoose";
import { z } from "zod";
import {
  runAnalyzePipeline,
  listHistory,
  getAnalysisForUser,
  enableShare,
  getSharedAnalysis,
} from "../services/analysis.service.js";

const analyzeBodySchema = z.object({
  input: z.string().min(1).max(500000),
  inputType: z.enum(["text", "url"]),
});

export async function postAnalyze(req, res, next) {
  try {
    const parsed = analyzeBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: { message: parsed.error.flatten().message } });
    }
    const userId = req.auth.uid;
    const analysis = await runAnalyzePipeline({
      userId,
      input: parsed.data.input.trim(),
      inputType: parsed.data.inputType,
    });
    res.status(200).json(analysis);
  } catch (e) {
    console.error("[CONTROLLER] postAnalyze error", e);
    next(e);
  }
}

export async function getHistory(req, res, next) {
  try {
    const list = await listHistory(req.auth.uid);
    res.json(list);
  } catch (e) {
    console.error("[CONTROLLER] getHistory error", e);
    next(e);
  }
}

export async function getAnalysisById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ error: { message: "Analysis not found." } });
    }
    const a = await getAnalysisForUser(req.auth.uid, id);
    if (!a) return res.status(404).json({ error: { message: "Analysis not found." } });
    res.json(a);
  } catch (e) {
    console.error("[CONTROLLER] getAnalysisById error", e);
    next(e);
  }
}

export async function postShare(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ error: { message: "Analysis not found." } });
    }
    const result = await enableShare(req.auth.uid, id);
    if (!result) return res.status(404).json({ error: { message: "Analysis not found." } });
    res.json(result);
  } catch (e) {
    console.error("[CONTROLLER] postShare error", e);
    next(e);
  }
}

export async function getSharePublic(req, res, next) {
  try {
    const { shareId } = req.params;
    const a = await getSharedAnalysis(shareId);
    if (!a) {
      return res.status(404).json({ error: { message: "This shared analysis is unavailable." } });
    }
    res.json(a);
  } catch (e) {
    console.error("[CONTROLLER] getSharePublic error", e);
    next(e);
  }
}
