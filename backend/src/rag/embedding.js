import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_MODEL = "text-embedding-004";

let genAI = null;
let embedModel = null;

function getEmbedModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is required for embeddings.");
  if (!genAI) {
    genAI = new GoogleGenerativeAI(key);
    embedModel = genAI.getGenerativeModel({ model: process.env.GEMINI_EMBEDDING_MODEL || DEFAULT_MODEL });
  }
  return embedModel;
}

export async function embedText(text) {
  const model = getEmbedModel();
  const res = await model.embedContent(text);
  const values = res.embedding?.values;
  if (!values?.length) throw new Error("Embedding response missing values.");
  return values;
}

export async function embedTexts(texts) {
  const out = [];
  for (const t of texts) {
    out.push(await embedText(t));
  }
  return out;
}
