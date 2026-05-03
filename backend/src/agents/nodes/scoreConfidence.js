import { credibilityForUrl } from "../../rag/credibility.js";

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

export async function scoreConfidenceNode(state) {
  console.log("[NODE] scoreConfidence start");
  try {
    const claims = state.claims || [];
    const verifiedClaims = state.verifiedClaims || [];
    const evidenceByClaimId = state.evidenceByClaimId || {};

    const scoredClaims = [];

    for (const c of claims) {
      const v = verifiedClaims.find((x) => x.claimId === c.id);
      const verdict = v?.verdict || "misleading";
      const explanation = v?.explanation || "Unable to verify this claim with retrieved evidence.";
      const evidence = evidenceByClaimId[c.id] || [];

      const citedUrls = new Set(v?.citedUrls || []);
      const sources = evidence
        .filter((e) => citedUrls.size === 0 || citedUrls.has(e.url))
        .slice(0, 6)
        .map((e) => ({
          title: e.title,
          url: e.url,
          reliabilityScore: credibilityForUrl(e.url),
        }));

      if (!sources.length && evidence.length) {
        sources.push(
          ...evidence.slice(0, 3).map((e) => ({
            title: e.title,
            url: e.url,
            reliabilityScore: credibilityForUrl(e.url),
          })),
        );
      }

      const topRel = sources.length ? Math.max(...sources.map((s) => s.reliabilityScore)) : 40;
      const agreement = verdict === "true" ? 88 : verdict === "misleading" ? 55 : 72;
      const coverage = clamp(evidence.length ? 60 + Math.min(35, evidence.length * 5) : 25, 0, 100);
      const confidenceBreakdown = {
        sourceReliability: clamp(topRel, 0, 100),
        agreement: clamp(agreement, 0, 100),
        coverage: clamp(coverage, 0, 100),
      };
      const confidence = Math.round(
        (confidenceBreakdown.sourceReliability + confidenceBreakdown.agreement + confidenceBreakdown.coverage) / 3,
      );

      scoredClaims.push({
        id: c.id,
        text: c.text,
        verdict,
        explanation,
        confidence,
        confidenceBreakdown,
        sources,
      });
    }

    return { scoredClaims };
  } catch (e) {
    console.error("[NODE] scoreConfidence error", e);
    throw e;
  } finally {
    console.log("[NODE] scoreConfidence end");
  }
}
