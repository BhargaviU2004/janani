import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is missing. AI features will be disabled.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const MODELS = {
  HEALTH_ANALYSIS: "gemini-3-flash-preview",
  REPORT_EXTRACTION: "gemini-3-flash-preview",
  NUTRITION_PLANNER: "gemini-3-flash-preview",
};
