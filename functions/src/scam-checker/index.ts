import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db, COLLECTIONS } from "../lib/firebase-admin";
import { generateText } from "../lib/groq";
import { evaluateRules, scoreToRiskLevel } from "./rules";
import { buildScamAnalysisPrompt } from "./prompts";
import { addRiskEvent } from "../risk/index";

interface AnalyzeScamRequest {
  text: string;
  type?: "MESSAGE" | "EMAIL" | "INVOICE" | "LINK";
  companyId?: string; // Optional — attaches result to risk profile if provided
}

// ── analyzeScam ───────────────────────────────────────────────
export const analyzeScam = onCall(async (request) => {
  const { text, type = "MESSAGE", companyId } = request.data as AnalyzeScamRequest;

  if (!text?.trim()) {
    throw new HttpsError("invalid-argument", "text is required.");
  }

  if (text.length > 10_000) {
    throw new HttpsError("invalid-argument", "Text must be under 10,000 characters.");
  }

  // ── Step 1: Rule engine (deterministic, always runs) ────────
  const { signals: ruleSignals, ruleScore } = evaluateRules(text);

  // ── Step 2: Gemini (AI layer, supplements rules) ────────────
  let aiSignals: string[] = [];
  let explanation = "";
  let recommendedAction = "";
  let aiConfidence = 0.5;

  try {
    const prompt = buildScamAnalysisPrompt({ text, ruleSignals, ruleScore });
    const raw = await generateText(prompt);

    // Extract JSON from response (Gemini sometimes wraps in markdown)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      aiSignals = parsed.additionalSignals || [];
      explanation = parsed.explanation || "";
      recommendedAction = parsed.recommendedAction || "";
      aiConfidence = Math.max(0, Math.min(1, parsed.aiConfidence || 0.5));
    }
  } catch (err) {
    // Groq unavailable — rule engine result still valid
    console.warn("[ScamChecker] Groq unavailable, using rules only:", err);
    explanation = ruleScore > 0
      ? `Rule-based analysis detected ${ruleSignals.length} scam signal(s). Manual review recommended.`
      : "No scam signals detected by the rule engine.";
    recommendedAction = ruleScore > 40
      ? "Do not respond or pay. Verify the sender through an independent official channel."
      : "No immediate action required. Stay cautious.";
    aiConfidence = 0.7;
  }

  // ── Step 3: Combine signals ──────────────────────────────────
  const allSignals = [...new Set([...ruleSignals, ...aiSignals])];

  // AI score: blend rule score with AI confidence signal
  const combinedScore = ruleScore > 0
    ? Math.min(100, ruleScore + (aiSignals.length * 5))
    : aiConfidence > 0.7 ? 30 : 0;

  const riskLevel = scoreToRiskLevel(combinedScore);
  const confidence = ruleScore > 0
    ? Math.min(0.99, 0.65 + ruleSignals.length * 0.05)
    : aiConfidence;

  // ── Step 4: Store the report ─────────────────────────────────
  const userId = request.auth?.uid;
  const reportRef = await db.collection(COLLECTIONS.SCAM_REPORTS).add({
    userId: userId || null,
    companyId: companyId || userId || null,
    text: text.slice(0, 500), // Store truncated version only
    type,
    riskLevel,
    confidence,
    signals: allSignals,
    ruleScore,
    explanation,
    recommendedAction,
    createdAt: FieldValue.serverTimestamp(),
  });

  // ── Step 5: Feed into risk engine if company ID available ────
  const effectiveCompanyId = companyId || userId;
  if (effectiveCompanyId && riskLevel !== "LOW") {
    const eventType = riskLevel === "CRITICAL" || riskLevel === "HIGH"
      ? "SCAM_DETECTED"
      : "SUSPICIOUS_MESSAGE";

    await addRiskEvent({
      companyId: effectiveCompanyId,
      eventType,
      source: "scam-checker",
      evidence: allSignals.slice(0, 3),
    });
  }

  return {
    id: reportRef.id,
    riskLevel,
    confidence,
    signals: allSignals,
    ruleScore,
    explanation,
    recommendedAction,
  };
});
