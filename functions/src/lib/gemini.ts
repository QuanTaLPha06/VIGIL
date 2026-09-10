/**
 * Google Gemini Flash client.
 * Free tier: 15 RPM, 1M tokens/day — sufficient for prototype.
 * API key set via: firebase functions:config:set gemini.api_key="YOUR_KEY"
 * or via .env for local emulator.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

let _client: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (_client) return _client;

  const apiKey =
    process.env.GEMINI_API_KEY ||
    (process.env.FUNCTIONS_EMULATOR ? process.env.GEMINI_API_KEY : undefined);

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY not set. Add it to .env for local dev or " +
        "firebase functions:config:set gemini.api_key=YOUR_KEY for production."
    );
  }

  _client = new GoogleGenerativeAI(apiKey);
  return _client;
}

export async function generateText(prompt: string): Promise<string> {
  const client = getGeminiClient();
  // gemini-1.5-flash — free tier, fast, 1M context
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
