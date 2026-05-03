import { randomUUID } from "node:crypto";
import { getChatGenerativeModel } from "../../config/gemini.js";
import { generateAndParseJson } from "../../utils/geminiJson.js";
import { extractClaimsOutput } from "../../utils/schemas.js";
import { MAX_CLAIMS } from "../../utils/constants.js";

export async function extractClaimsNode(state) {
  console.log("[NODE] extractClaims start");
  try {
    const model = getChatGenerativeModel();
    const prompt = `Extract distinct, atomic, verifiable factual claims from the following content. Return JSON only. Maximum ${MAX_CLAIMS} claims. Each claim should be a single sentence when possible.

Content:
"""
${(state.rawText || "").slice(0, 80000)}
"""`;

    try {
      const data = await generateAndParseJson(model, prompt, extractClaimsOutput);
      const claims = (data.claims || [])
        .map((c) => ({ id: randomUUID(), text: c.text.trim() }))
        .filter((c) => c.text.length > 0)
        .slice(0, MAX_CLAIMS);
      if (!claims.length) {
        return { claims: [], errorLog: ["No verifiable claims extracted from the input."] };
      }
      return { claims };
    } catch (e) {
      console.error("[NODE] extractClaims error", e);
      const msg = e instanceof Error ? e.message : String(e);
      return { claims: [], errorLog: [`extractClaims: ${msg}`] };
    }
  } catch (e) {
    console.error("[NODE] extractClaims error", e);
    throw e;
  } finally {
    console.log("[NODE] extractClaims end");
  }
}
