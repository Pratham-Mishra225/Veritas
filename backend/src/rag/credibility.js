/**
 * Hostname tier 0–100 for combining with relevance in ranking.
 * Extend as needed for your trusted-source policy.
 */
const TIERS = [
  [/^([^.]+\.)?gov\./i, 95],
  [/^([^.]+\.)?edu/i, 88],
  [/who\.int$/i, 96],
  [/nih\.gov$/i, 94],
  [/cdc\.gov$/i, 94],
  [/reuters\.com$/i, 82],
  [/apnews\.com$/i, 82],
  [/bbc\.(co\.uk|com)$/i, 80],
  [/wikipedia\.org$/i, 72],
];

/**
 * @param {string} url
 * @returns {number}
 */
export function credibilityForUrl(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    for (const [re, score] of TIERS) {
      if (re.test(host)) return score;
    }
    return 55;
  } catch {
    return 50;
  }
}
