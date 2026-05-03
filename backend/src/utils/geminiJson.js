import { z } from "zod";

/**
 * @template T
 * @param {import("@google/generative-ai").GenerativeModel} model
 * @param {string} userPrompt
 * @param {z.ZodType<T>} schema
 * @returns {Promise<T>}
 */
export async function generateAndParseJson(model, userPrompt, schema) {
  const res = await model.generateContent(userPrompt);
  const text = res.response.text();
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("Model did not return JSON.");
    raw = JSON.parse(m[0]);
  }
  return schema.parse(raw);
}
