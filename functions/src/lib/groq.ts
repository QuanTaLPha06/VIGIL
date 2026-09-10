/**
 * Groq AI client for VIGIL.
 *
 * Free tier (no credit card needed): console.groq.com/keys
 * Models used:
 *   - llama-3.3-70b-versatile  → best quality, scam analysis + explanations
 *   - llama-3.1-8b-instant     → fastest, simple classification tasks
 *
 * Why Groq over Gemini:
 *   - Faster inference (better for live demo)
 *   - Free tier is generous (14,400 requests/day on free plan)
 *   - OpenAI-compatible API — easy to swap models
 */

import Groq from "groq-sdk";

let _client: Groq | null = null;

export function getGroqClient(): Groq {
  if (_client) return _client;

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY not set. Get a free key at console.groq.com/keys " +
        "and add it to .env.local (local) or Firebase secrets (production):\n" +
        "  firebase functions:secrets:set GROQ_API_KEY"
    );
  }

  _client = new Groq({ apiKey });
  return _client;
}

/**
 * Generate text using Groq.
 * Defaults to llama-3.3-70b-versatile for best quality.
 * Use model="llama-3.1-8b-instant" for faster/cheaper calls.
 */
export async function generateText(
  prompt: string,
  model: "llama-3.3-70b-versatile" | "llama-3.1-8b-instant" | "mixtral-8x7b-32768" = "llama-3.3-70b-versatile"
): Promise<string> {
  const client = getGroqClient();

  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are VIGIL's AI assistant. You help Indian MSMEs identify cyber risks, " +
          "analyze suspicious communications, and make safer financial decisions. " +
          "Be concise, accurate, and focused on Indian business context.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.2,      // Low temperature — we want consistent, factual output
    max_tokens: 1024,
    response_format: { type: "text" },
  });

  return completion.choices[0]?.message?.content ?? "";
}

/**
 * Faster variant — use for simple classification tasks.
 */
export async function generateTextFast(prompt: string): Promise<string> {
  return generateText(prompt, "llama-3.1-8b-instant");
}
