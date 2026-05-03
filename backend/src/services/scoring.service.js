/**
 * Roll up overall credibility score from claim verdicts (deterministic).
 * @param {{ verdict: string, confidence: number }[]} claims
 */
export function rollUpOverallScore(claims) {
  if (!claims.length) return 0;
  let sum = 0;
  for (const c of claims) {
    const w = c.verdict === "true" ? 1 : c.verdict === "misleading" ? 0.5 : 0;
    sum += w * (c.confidence ?? 50);
  }
  return Math.round(sum / claims.length);
}
