import { embedText } from "./embedding.js";
import { getTrustedSourcesCollection } from "./collection.js";
import { searchWeb } from "./webSearch.js";
import { normalizeUrl } from "./urlUtils.js";

/**
 * @typedef {object} RetrievedSource
 * @property {string} title
 * @property {string} url
 * @property {string} snippet
 * @property {number} [vectorDistance]
 * @property {number} [webRank]
 * @property {'vector'|'web'} [sourceChannel]
 */

/**
 * @param {string} query
 * @param {{ topK?: number, includeWeb?: boolean, sessionId?: string }} [options]
 * @returns {Promise<RetrievedSource[]>}
 */
export async function retrieveRelevantDocuments(query, options = {}) {
  const topK = options.topK ?? 8;
  const includeWeb = options.includeWeb !== false;
  const sessionId = options.sessionId;

  /** @type {RetrievedSource[]} */
  const results = [];

  try {
    const coll = await getTrustedSourcesCollection();
    const qemb = await embedText(query);
    /** @type {Record<string, unknown>} */
    const where = {};
    if (sessionId) where.sessionId = sessionId;

    const qr = await coll.query({
      queryEmbeddings: [qemb],
      nResults: topK,
      ...(Object.keys(where).length ? { where } : {}),
      include: ["documents", "metadatas", "distances"],
    });

    const ids = qr.ids?.[0] ?? [];
    const metas = qr.metadatas?.[0] ?? [];
    const docs = qr.documents?.[0] ?? [];
    const dists = qr.distances?.[0] ?? [];

    for (let i = 0; i < ids.length; i++) {
      const meta = metas[i] && typeof metas[i] === "object" ? metas[i] : {};
      const url = typeof meta.url === "string" ? meta.url : "";
      if (!url) continue;
      results.push({
        title: typeof meta.title === "string" ? meta.title : "Source",
        url,
        snippet: (docs[i] || "").slice(0, 4000),
        vectorDistance: typeof dists[i] === "number" ? dists[i] : undefined,
        sourceChannel: "vector",
      });
    }
  } catch {
    // Chroma unavailable — continue with web-only per plan
  }

  if (includeWeb) {
    try {
      const web = await searchWeb(query);
      web.forEach((w, i) => {
        results.push({
          ...w,
          webRank: i + 1,
          sourceChannel: "web",
        });
      });
    } catch {
      // No web results
    }
  }

  const seen = new Map();
  for (const r of results) {
    if (!r.url?.startsWith("http")) continue;
    const k = normalizeUrl(r.url);
    if (!seen.has(k)) seen.set(k, r);
  }
  return [...seen.values()];
}
