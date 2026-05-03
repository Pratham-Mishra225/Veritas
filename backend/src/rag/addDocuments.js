import { randomUUID } from "node:crypto";
import { embedText } from "./embedding.js";
import { getTrustedSourcesCollection } from "./collection.js";

function chunkText(text, maxLen) {
  const paras = text.split(/\n\s*\n/).filter(Boolean);
  const chunks = [];
  let buf = "";
  for (const p of paras) {
    if ((buf + p).length > maxLen && buf) {
      chunks.push(buf.trim());
      buf = p;
    } else buf += (buf ? "\n\n" : "") + p;
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks.length ? chunks : [text.slice(0, maxLen)];
}

/**
 * Ingest trusted documents into Chroma with Gemini embeddings.
 * @param {{ title: string, url: string, text: string }[]} documents
 * @param {{ sessionId?: string }} [options]
 */
export async function ingestTrustedDocuments(documents, options = {}) {
  const sessionId = options.sessionId;
  const coll = await getTrustedSourcesCollection();
  const ids = [];
  const embeddings = [];
  const metadatas = [];
  const docs = [];

  for (const doc of documents) {
    const chunks = chunkText(doc.text, 900);
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      ids.push(`trusted_${randomUUID()}`);
      embeddings.push(await embedText(chunk));
      metadatas.push({
        title: doc.title,
        url: doc.url,
        sourceType: "trusted",
        chunkIndex: String(i),
        ...(sessionId ? { sessionId } : {}),
      });
      docs.push(chunk);
    }
  }

  if (ids.length) {
    await coll.add({ ids, embeddings, metadatas, documents: docs });
  }
}
