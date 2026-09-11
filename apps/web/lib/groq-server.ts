/**
 * Groq client — server-side only (API routes).
 * Never import this in client components.
 */

import Groq from "groq-sdk";

let _client: Groq | null = null;

function getClient(): Groq {
  if (_client) return _client;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set.");
  _client = new Groq({ apiKey });
  return _client;
}

export async function generateText(
  prompt: string,
  model:
    | "llama-3.3-70b-versatile"
    | "llama-3.1-8b-instant"
    | "mixtral-8x7b-32768" = "llama-3.3-70b-versatile"
): Promise<string> {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are VIGIL's AI assistant helping Indian MSMEs identify cyber risks, " +
          "analyze suspicious communications, and make safer financial decisions. " +
          "Be concise, accurate, and focused on Indian business context.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 1024,
  });
  return completion.choices[0]?.message?.content ?? "";
}
