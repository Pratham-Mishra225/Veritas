import { getChatGenerativeModel } from "../../config/gemini.js";
import { generateAndParseJson } from "../../utils/geminiJson.js";
import { verifyClaimsOutput } from "../../utils/schemas.js";

function allowedUrlsSet(evidenceList) {
  return new Set((evidenceList || []).map((e) => e.url).filter(Boolean));
}

function filterCitedUrls(cited, allowed) {
  return (cited || []).filter((u) => allowed.has(u));
}

export async function verifyClaimsNode(state) {
  console.log("[NODE] verifyClaims start");
  try {
    const claims = state.claims || [];
    const evidenceByClaimId = state.evidenceByClaimId || {};
    if (!claims.length) {
      return { verifiedClaims: [] };
    }

    const blocks = claims.map((c) => {
      const ev = evidenceByClaimId[c.id] || [];
      const evText = ev.map((e, i) => `[${i + 1}] ${e.title}\nURL: ${e.url}\n${e.snippet}`).join("\n\n");
      return `CLAIM_ID: ${c.id}\nTEXT: ${c.text}\nEVIDENCE:\n${evText || "(no evidence retrieved)"}\n`;
    });

    const model = getChatGenerativeModel();
    const prompt = `You are a fact-checker. For each claim, assign verdict true / misleading / false using ONLY the evidence block for that claim. citedUrls must be a subset of evidence URLs for that claim. If evidence is insufficient, use verdict misleading and explain uncertainty.

${blocks.join("\n---\n")}

Return JSON only with one entry per claim in results.`;

    try {
      const data = await generateAndParseJson(model, prompt, verifyClaimsOutput);
      const byId = new Map((data.results || []).map((r) => [r.claimId, r]));
      /** @type {{ claimId: string, verdict: string, explanation: string, citedUrls: string[] }[]} */
      const verifiedClaims = [];
      for (const c of claims) {
        const r = byId.get(c.id);
        const ev = evidenceByClaimId[c.id] || [];
        const allowed = allowedUrlsSet(ev);
        if (r) {
          verifiedClaims.push({
            claimId: r.claimId,
            verdict: r.verdict,
            explanation: r.explanation,
            citedUrls: filterCitedUrls(r.citedUrls, allowed),
          });
        } else {
          verifiedClaims.push({
            claimId: c.id,
            verdict: "misleading",
            explanation: "Verification step did not return a result for this claim; treating as uncertain.",
            citedUrls: [],
          });
        }
      }
      return { verifiedClaims };
    } catch (e) {
      console.error("[NODE] verifyClaims error", e);
      const msg = e instanceof Error ? e.message : String(e);
      return {
        verifiedClaims: [],
        errorLog: [`verifyClaims: ${msg}`],
      };
    }
  } catch (e) {
    console.error("[NODE] verifyClaims error", e);
    throw e;
  } finally {
    console.log("[NODE] verifyClaims end");
  }
}
