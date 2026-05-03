import { ChromaClient } from "chromadb";

let client = null;

export function getChromaClient() {
  if (!client) {
    const host = process.env.CHROMA_HOST || "localhost";
    const port = Number(process.env.CHROMA_PORT || 8000, 10);
    const ssl = process.env.CHROMA_SSL === "true";
    client = new ChromaClient({ host, port, ssl });
  }
  return client;
}

export async function chromaHeartbeat() {
  try {
    await getChromaClient().heartbeat();
    return true;
  } catch {
    return false;
  }
}
