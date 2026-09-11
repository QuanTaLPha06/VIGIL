/**
 * POST /api/scam
 * Analyzes text for scam signals using rule engine + Groq.
 */

import { NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, verifyAuthToken, ok, err, COLLECTIONS } from "@/lib/firebase-admin";
import { generateText } from "@/lib/groq-server";

// ── Rule engine ───────────────────────────────────────────────
const RULES: Array<{ patterns: RegExp[]; signal: string; weight: number }> = [
  {
    patterns: [/urgent/i, /immediate/i, /within 24 hours?/i, /act now/i, /block(?:ed|ing)/i, /suspend(?:ed|ing)/i, /aaj tak/i],
    signal: "Urgency / pressure tactics",
    weight: 18,
  },
  {
    patterns: [/pay\s+(?:now|immediately)/i, /transfer\s+(?:now|immediately)/i, /send\s+(?:money|funds|payment)/i, /advance\s+payment/i, /processing\s+fee/i],
    signal: "Unexpected payment request",
    weight: 20,
  },
  {
    patterns: [/kyc\s*(?:update|verification|expired|pending)/i, /aadhar|aadhaar/i, /rbi\s*(?:notice|penalty)/i, /income\s*tax\s*(?:notice|department)/i, /sbi\s*customer\s*care/i],
    signal: "KYC / identity impersonation language",
    weight: 22,
  },
  {
    patterns: [/(?:click|tap|open)\s+(?:here|link|below)/i, /bit\.ly|tinyurl|t\.co/i],
    signal: "Suspicious link detected",
    weight: 15,
  },
  {
    patterns: [/(?:share|send|provide|enter)\s+(?:your\s+)?(?:otp|password|pin|cvv)/i, /one.?time.?password/i, /atm\s*pin/i],
    signal: "Request for sensitive information (OTP/PIN)",
    weight: 25,
  },
  {
    patterns: [/won\s+(?:a\s+)?(?:lottery|prize|reward)/i, /congratulation/i, /lucky\s+winner/i],
    signal: "Lottery / prize fraud pattern",
    weight: 20,
  },
  {
    patterns: [/work\s+from\s+home/i, /earn\s+\d+.*per\s*(?:day|month)/i, /part.?time.*income/i],
    signal: "Job / work-from-home fraud pattern",
    weight: 15,
  },
];

function runRules(text: string) {
  const matched = RULES.filter((r) => r.patterns.some((p) => p.test(text)));
  const score = Math.min(100, matched.reduce((s, r) => s + r.weight, 0));
  return { signals: matched.map((r) => r.signal), score };
}

function scoreToLevel(score: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (score === 0) return "LOW";
  if (score < 20) return "LOW";
  if (score < 40) return "MEDIUM";
  if (score < 65) return "HIGH";
  return "CRITICAL";
}

export async function POST(req: NextRequest) {
  const uid = await verifyAuthToken(req);
  if (!uid) return err("Unauthorized", 401);

  const body = await req.json().catch(() => ({}));
  const { text, type = "MESSAGE", companyId } = body as {
    text: string;
    type?: string;
    companyId?: string;
  };

  if (!text?.trim()) return err("text is required");
  if (text.length > 10_000) return err("Text must be under 10,000 characters");

  // Step 1: Rule engine
  const { signals: ruleSignals, score: ruleScore } = runRules(text);

  // Step 2: Groq (supplements rules — fallback gracefully)
  let aiSignals: string[] = [];
  let explanation = "";
  let recommendedAction = "";
  let aiConfidence = 0.5;

  try {
    const prompt = `You are VIGIL's scam detection assistant for Indian MSMEs.

Rule engine results:
- Score: ${ruleScore}/100
- Signals: ${ruleSignals.length > 0 ? ruleSignals.join(", ") : "none"}

Analyze this message and respond with JSON only (no markdown):
{
  "additionalSignals": ["signals NOT already captured above"],
  "explanation": "2-3 sentences explaining why this is or isn't suspicious",
  "recommendedAction": "specific actionable advice for an Indian MSME owner",
  "aiConfidence": 0.0
}

MESSAGE:
---
${text}
---`;

    const raw = await generateText(prompt, "llama-3.1-8b-instant");
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      aiSignals = parsed.additionalSignals || [];
      explanation = parsed.explanation || "";
      recommendedAction = parsed.recommendedAction || "";
      aiConfidence = Math.max(0, Math.min(1, parsed.aiConfidence || 0.5));
    }
  } catch {
    explanation = ruleScore > 0
      ? `Rule-based analysis detected ${ruleSignals.length} scam signal(s). Manual review recommended.`
      : "No scam signals detected by the rule engine.";
    recommendedAction = ruleScore > 40
      ? "Do not respond or pay. Verify the sender through an independent official channel."
      : "No immediate action required. Stay cautious.";
    aiConfidence = 0.7;
  }

  const allSignals = [...new Set([...ruleSignals, ...aiSignals])];
  const combinedScore = Math.min(100, ruleScore + aiSignals.length * 5);
  const riskLevel = scoreToLevel(combinedScore);
  const confidence = ruleScore > 0
    ? Math.min(0.99, 0.65 + ruleSignals.length * 0.05)
    : aiConfidence;

  // Step 3: Save report
  const effectiveCompanyId = companyId || uid;
  const ref = await adminDb.collection(COLLECTIONS.SCAM_REPORTS).add({
    userId: uid,
    companyId: effectiveCompanyId,
    text: text.slice(0, 500),
    type,
    riskLevel,
    confidence,
    signals: allSignals,
    ruleScore,
    explanation,
    recommendedAction,
    createdAt: FieldValue.serverTimestamp(),
  });

  // Step 4: Feed into risk engine if elevated
  if (riskLevel !== "LOW") {
    const eventType = riskLevel === "CRITICAL" || riskLevel === "HIGH" ? "SCAM_DETECTED" : "SUSPICIOUS_MESSAGE";
    const delta = eventType === "SCAM_DETECTED" ? 18 : 15;
    const severity = delta >= 15 ? "HIGH" : "MEDIUM";
    const { getEventReason, applyEvent, INITIAL_RISK_PROFILE } = await import("@/lib/risk-calculator");
    const profileSnap = await adminDb.collection(COLLECTIONS.RISK_PROFILES).doc(effectiveCompanyId).get();
    const current = profileSnap.exists ? profileSnap.data() : { ...INITIAL_RISK_PROFILE };

    await Promise.all([
      adminDb.collection(COLLECTIONS.RISK_EVENTS).add({
        companyId: effectiveCompanyId,
        eventType,
        severity,
        source: "scam-checker",
        scoreDelta: delta,
        evidence: allSignals.slice(0, 3),
        createdAt: FieldValue.serverTimestamp(),
      }),
      adminDb.collection(COLLECTIONS.RISK_PROFILES).doc(effectiveCompanyId).set(
        { ...applyEvent(current as Parameters<typeof applyEvent>[0], eventType), companyId: effectiveCompanyId, updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      ),
    ]);
  }

  return ok({ id: ref.id, riskLevel, confidence, signals: allSignals, ruleScore, explanation, recommendedAction });
}
