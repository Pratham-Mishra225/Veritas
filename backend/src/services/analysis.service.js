import * as cheerio from "cheerio";
import { randomUUID } from "node:crypto";
import { AnalysisModel } from "../models/analysis.model.js";
import { getAnalysisGraph } from "../agents/graph.js";
import { MAX_URL_BYTES, FETCH_TIMEOUT_MS } from "../utils/constants.js";
import { logger } from "../utils/logger.js";

function logServiceError(scope, err) {
  console.error(`[SERVICE] ${scope} error`, err);
}

export function plainToAnalysis(o) {
  if (!o) return null;
  const id = o._id != null ? String(o._id) : o.id;
  const created = o.createdAt instanceof Date ? o.createdAt : new Date(o.createdAt);
  return {
    id,
    input: o.input,
    inputType: o.inputType,
    createdAt: created.toISOString(),
    claims: o.claims || [],
    overallScore: o.overallScore ?? 0,
    summary: o.summary ?? "",
    share: {
      isPublic: o.share?.isPublic ?? false,
      shareId: o.share?.shareId ?? "",
    },
  };
}

export async function fetchUrlText(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "User-Agent": "VeritasBackend/1.0 (+https://veritas)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_URL_BYTES) throw new Error("Content too large.");
    const html = Buffer.from(buf).toString("utf8");
    const $ = cheerio.load(html);
    $("script, style, nav, footer, noscript, iframe").remove();
    const text = $("body").text().replace(/\s+/g, " ").trim();
    if (!text) throw new Error("Could not extract readable text from URL.");
    return text.slice(0, 500000);
  } catch (err) {
    logServiceError("fetchUrlText", err);
    throw err;
  } finally {
    clearTimeout(t);
  }
}

export async function runAnalyzePipeline({ userId, input, inputType }) {
  try {
    let rawText = input;
    if (inputType === "url") {
      rawText = await fetchUrlText(input);
    }

    const doc = await AnalysisModel.create({
      userId,
      input,
      inputType,
      claims: [],
      overallScore: 0,
      summary: "",
      share: { isPublic: false },
    });

    const graph = getAnalysisGraph();
    const out = await graph.invoke({
      rawText,
      inputType,
      analysisId: String(doc._id),
      userInput: input,
      claims: [],
      queriesByClaimId: {},
      evidenceByClaimId: {},
      verifiedClaims: [],
      scoredClaims: [],
      summary: "",
      overallScore: 0,
      errorLog: [],
      pipelineAborted: false,
    });

    await AnalysisModel.findByIdAndUpdate(doc._id, {
      $set: {
        claims: out.scoredClaims || [],
        overallScore: out.overallScore ?? 0,
        summary: out.summary ?? "",
      },
    });

    const updated = await AnalysisModel.findById(doc._id);
    return plainToAnalysis(updated);
  } catch (err) {
    logServiceError("runAnalyzePipeline", err);
    throw err;
  }
}

export async function listHistory(userId) {
  try {
    const rows = await AnalysisModel.find({ userId }).sort({ createdAt: -1 }).lean();
    return rows.map((o) => plainToAnalysis(o));
  } catch (err) {
    logServiceError("listHistory", err);
    throw err;
  }
}

export async function getAnalysisForUser(userId, analysisId) {
  try {
    const o = await AnalysisModel.findOne({ _id: analysisId, userId }).lean();
    return plainToAnalysis(o);
  } catch (err) {
    logServiceError("getAnalysisForUser", err);
    throw err;
  }
}

export async function enableShare(userId, analysisId) {
  try {
    const doc = await AnalysisModel.findOne({ _id: analysisId, userId });
    if (!doc) return null;
    const shareId = doc.share?.shareId || randomUUID();
    doc.share = { isPublic: true, shareId };
    await doc.save();
    const base = (process.env.PUBLIC_APP_URL || "http://localhost:5173").replace(/\/$/, "");
    const url = `${base}/share/${shareId}`;
    logger.info({ analysisId, shareId }, "share enabled");
    return { shareId, url };
  } catch (err) {
    logServiceError("enableShare", err);
    throw err;
  }
}

export async function getSharedAnalysis(shareId) {
  try {
    const o = await AnalysisModel.findOne({
      "share.shareId": shareId,
      "share.isPublic": true,
    }).lean();
    return plainToAnalysis(o);
  } catch (err) {
    logServiceError("getSharedAnalysis", err);
    throw err;
  }
}
