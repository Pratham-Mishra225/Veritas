import { getChromaClient } from "./chromaClient.js";

const NAME = process.env.CHROMA_TRUSTED_COLLECTION || "veritas_trusted_sources";

export async function getTrustedSourcesCollection() {
  const chroma = getChromaClient();
  const existing = await chroma.listCollections();
  const found = existing.find((c) => c.name === NAME);
  if (found) {
    return chroma.getCollection({ name: NAME, embeddingFunction: null });
  }
  return chroma.createCollection({
    name: NAME,
    metadata: { description: "Trusted sources for Veritas RAG" },
    embeddingFunction: null,
  });
}
