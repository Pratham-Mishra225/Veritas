import { getChatGenerativeModel } from "../../config/gemini.js";
import { generateAndParseJson } from "../../utils/geminiJson.js";
import { generateQueriesOutput } from "../../utils/schemas.js";

export async function generateQueriesNode(state) {
  console.log("[NODE] generateQueries start");
  try {
    const claims = state.claims || [];
    if (!claims.length) {
      return { queriesByClaimId: {}, errorLog: ["generateQueries: no claims."] };
    }

    const model = getChatGenerativeModel();
    const lines = claims.map((c) => `- id=${c.id} | ${c.text}`).join("\n");
    const prompt = `For each claim, propose 1–3 short web search queries to find independent evidence (facts, stats, official sources). Return JSON only.

Claims:
${lines}`;

    try {
      const data = await generateAndParseJson(model, prompt, generateQueriesOutput);
      /** @type {Record<string, string[]>} */
      const queriesByClaimId = {};
      for (const row of data.perClaim || []) {
        if (row.claimId && row.queries?.length) {
          queriesByClaimId[row.claimId] = row.queries.map((q) => q.trim()).filter(Boolean);
        }
      }
      for (const c of claims) {
        if (!queriesByClaimId[c.id]?.length) {
          queriesByClaimId[c.id] = [c.text.slice(0, 240)];
        }
      }
      return { queriesByClaimId };
    } catch (e) {
      console.error("[NODE] generateQueries error", e);
      const msg = e instanceof Error ? e.message : String(e);
      const fallback = {};
      for (const c of claims) {
        fallback[c.id] = [c.text.slice(0, 240)];
      }
      return { queriesByClaimId: fallback, errorLog: [`generateQueries: ${msg}`] };
    }
  } catch (e) {
    console.error("[NODE] generateQueries error", e);
    throw e;
  } finally {
    console.log("[NODE] generateQueries end");
  }
}
