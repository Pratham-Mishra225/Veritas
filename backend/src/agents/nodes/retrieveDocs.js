import { retrieveRelevantDocuments, rankSourcesByRelevanceAndCredibility } from "../../rag/index.js";

export async function retrieveDocsNode(state) {
  console.log("[NODE] retrieveDocs start");
  try {
    const claims = state.claims || [];
    const queriesByClaimId = state.queriesByClaimId || {};
    /** @type {Record<string, { title: string, url: string, snippet: string }[]>} */
    const evidenceByClaimId = {};

    /** @type {string[]} */
    const errs = [];
    for (const c of claims) {
      const qlist = queriesByClaimId[c.id] || [c.text.slice(0, 200)];
      const joined = qlist.slice(0, 3).join(" ");
      try {
        const raw = await retrieveRelevantDocuments(joined, {
          topK: 10,
          includeWeb: true,
        });
        const ranked = rankSourcesByRelevanceAndCredibility(raw);
        evidenceByClaimId[c.id] = ranked.slice(0, 12).map((s) => ({
          title: s.title,
          url: s.url,
          snippet: s.snippet,
        }));
      } catch (e) {
        console.error(`[NODE] retrieveDocs error for claim ${c.id}`, e);
        const msg = e instanceof Error ? e.message : String(e);
        evidenceByClaimId[c.id] = [];
        errs.push(`retrieveDocs claim ${c.id}: ${msg}`);
      }
    }

    return errs.length ? { evidenceByClaimId, errorLog: errs } : { evidenceByClaimId };
  } catch (e) {
    console.error("[NODE] retrieveDocs error", e);
    throw e;
  } finally {
    console.log("[NODE] retrieveDocs end");
  }
}
