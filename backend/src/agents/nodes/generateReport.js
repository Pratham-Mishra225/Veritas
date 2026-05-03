import { rollUpOverallScore } from "../../services/scoring.service.js";
import { getChatGenerativeModel } from "../../config/gemini.js";
import { generateAndParseJson } from "../../utils/geminiJson.js";
import { generateReportOutput } from "../../utils/schemas.js";

export async function generateReportNode(state) {
  console.log("[NODE] generateReport start");
  try {
    const scored = state.scoredClaims || [];
    const roll = rollUpOverallScore(scored.map((s) => ({ verdict: s.verdict, confidence: s.confidence })));

    if (!scored.length) {
      const errs = (state.errorLog || []).join("; ");
      return {
        summary: errs ? `Analysis incomplete: ${errs}` : "No claims could be analyzed.",
        overallScore: 0,
        pipelineAborted: true,
      };
    }

    const model = getChatGenerativeModel();
    const prompt = `Write a concise neutral summary (2–4 sentences) for lay readers about this credibility assessment.

Use this rolled-up score as context only; the API will set the final integer score to ${roll}.

Claims (truncated):
${JSON.stringify(
      scored.map((c) => ({
        verdict: c.verdict,
        text: c.text.slice(0, 160),
        confidence: c.confidence,
      })),
      null,
      2,
    )}

Return JSON with keys summary (string) and overallScore (number 0-100).`;

    try {
      const data = await generateAndParseJson(model, prompt, generateReportOutput);
      return {
        summary: data.summary,
        overallScore: roll,
        pipelineAborted: !!state.pipelineAborted,
      };
    } catch (e) {
      console.error("[NODE] generateReport error", e);
      return {
        summary: `Assessment covers ${scored.length} claim(s) with an aggregate credibility index derived from retrieved sources.`,
        overallScore: roll,
      };
    }
  } catch (e) {
    console.error("[NODE] generateReport error", e);
    throw e;
  } finally {
    console.log("[NODE] generateReport end");
  }
}
