import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;

export function getGenAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set.");
  if (!genAI) genAI = new GoogleGenerativeAI(key);
  return genAI;
}

export function getChatGenerativeModel() {
  return getGenAI().getGenerativeModel({
    model: process.env.GEMINI_CHAT_MODEL || "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });
}
