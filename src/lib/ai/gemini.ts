import "server-only";
import { GoogleGenAI } from "@google/genai";

// Centralized server-only Gemini client initialization
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in server environment.");
  }
  return new GoogleGenAI({ apiKey });
}

// Current production generally-available fast Gemini model
export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
