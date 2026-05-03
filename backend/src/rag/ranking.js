import { credibilityForUrl } from "./credibility.js";

/**
 * @typedef {import("./query.js").RetrievedSource & { combinedScore?: number }} RankedSource
 */

/**
 * @param {import("./query.js").RetrievedSource[]} sources
 * @returns {RankedSource[]}
 */
export function rankSourcesByRelevanceAndCredibility(sources) {
  const scored = sources.map((s) => {
    const cred = credibilityForUrl(s.url);
    let rel = 0.5;
    if (typeof s.vectorDistance === "number") {
      rel = 1 / (1 + Math.max(0, s.vectorDistance));
    } else if (typeof s.webRank === "number") {
      rel = 1 / (1 + Math.log1p(s.webRank));
    }
    const combinedScore = 0.45 * rel + 0.55 * (cred / 100);
    return { ...s, combinedScore };
  });
  return scored.sort((a, b) => (b.combinedScore ?? 0) - (a.combinedScore ?? 0));
}
