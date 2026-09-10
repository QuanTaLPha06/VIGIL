/**
 * Gemini prompts for scam analysis.
 * Gemini supplements the rule engine — it does not replace it.
 */

export function buildScamAnalysisPrompt(params: {
  text: string;
  ruleSignals: string[];
  ruleScore: number;
}): string {
  const { text, ruleSignals, ruleScore } = params;

  return `You are VIGIL's scam detection assistant for Indian MSMEs.

A deterministic rule engine has already analyzed this message and produced these results:
- Rule-based score: ${ruleScore}/100
- Rule signals detected: ${ruleSignals.length > 0 ? ruleSignals.join(", ") : "none"}

Now analyze the message yourself and respond with a JSON object only (no markdown, no explanation outside the JSON):

{
  "additionalSignals": ["list any scam signals NOT already captured by the rules above"],
  "explanation": "2-3 sentences explaining WHY this is or is not suspicious, referencing specific parts of the message",
  "recommendedAction": "specific, actionable advice for an Indian MSME owner (e.g. Do not pay. Verify the sender by calling their official number.)",
  "aiConfidence": 0.0 to 1.0
}

MESSAGE TO ANALYZE:
---
${text}
---

Rules: Be concise. Focus on Indian MSME context (GSTIN, GST, UPI, Aadhaar, PAN, RBI, SEBI, income tax, NEFT/RTGS/IMPS fraud). If the message appears legitimate, say so clearly.`;
}
