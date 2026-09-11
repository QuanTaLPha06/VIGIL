/**
 * POST /api/payments
 * Contextual single-payment risk assessment.
 */

import { NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, verifyAuthToken, ok, err, COLLECTIONS } from "@/lib/firebase-admin";
import { applyEvent, getEventDelta, getEventReason, INITIAL_RISK_PROFILE } from "@/lib/risk-calculator";

export async function POST(req: NextRequest) {
  const uid = await verifyAuthToken(req);
  if (!uid) return err("Unauthorized", 401);

  const body = await req.json().catch(() => ({}));
  const { amount, monthlyOutflow, counterparty, purpose } = body as {
    amount: number;
    monthlyOutflow: number;
    counterparty?: string;
    purpose?: string;
  };

  if (!amount || !monthlyOutflow) return err("amount and monthlyOutflow are required");
  if (amount <= 0 || monthlyOutflow <= 0) return err("Values must be positive");

  const ratio = (amount / monthlyOutflow) * 100;

  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  let reasoning: string;
  let recommendation: string;
  let eventType: string | null = null;

  if (ratio < 15) {
    riskLevel = "LOW";
    reasoning = `Payment of ₹${amount.toLocaleString("en-IN")} is ${ratio.toFixed(1)}% of monthly outflow — within normal range.`;
    recommendation = "Proceed with standard due diligence.";
  } else if (ratio < 30) {
    riskLevel = "MEDIUM";
    reasoning = `Payment is ${ratio.toFixed(1)}% of monthly outflow — moderately elevated.`;
    recommendation = "Verify the counterparty via Watchtower before proceeding.";
  } else if (ratio < 50) {
    riskLevel = "HIGH";
    reasoning = `Payment is ${ratio.toFixed(1)}% of monthly outflow — significant proportion.`;
    recommendation = "Do not pay without completing Watchtower verification and reviewing the invoice.";
    eventType = "HIGH_VALUE_PAYMENT";
  } else {
    riskLevel = "CRITICAL";
    reasoning = `Payment is ${ratio.toFixed(1)}% of monthly outflow — exceptionally large.`;
    recommendation = "Pause this payment. Independently verify the request and consider DealLock protection.";
    eventType = "HIGH_VALUE_PAYMENT";
  }

  const ref = await adminDb.collection(COLLECTIONS.PAYMENTS).add({
    userId: uid, companyId: uid, amount, monthlyOutflow,
    outflowRatio: ratio, riskLevel, reasoning, recommendation,
    counterparty: counterparty || null, purpose: purpose || null,
    createdAt: FieldValue.serverTimestamp(),
  });

  if (eventType) {
    const delta = getEventDelta(eventType);
    const profileSnap = await adminDb.collection(COLLECTIONS.RISK_PROFILES).doc(uid).get();
    const current = profileSnap.exists ? profileSnap.data() : { ...INITIAL_RISK_PROFILE };
    await Promise.all([
      adminDb.collection(COLLECTIONS.RISK_EVENTS).add({
        companyId: uid, eventType, severity: "MEDIUM", source: "payment-assessor", scoreDelta: delta,
        evidence: [`Payment ₹${amount.toLocaleString("en-IN")} is ${ratio.toFixed(1)}% of monthly outflow`, counterparty ? `Counterparty: ${counterparty}` : "Counterparty not verified"],
        createdAt: FieldValue.serverTimestamp(),
      }),
      adminDb.collection(COLLECTIONS.RISK_PROFILES).doc(uid).set(
        { ...applyEvent(current as Parameters<typeof applyEvent>[0], eventType), companyId: uid, updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      ),
    ]);
  }

  return ok({ id: ref.id, amount, monthlyOutflow, outflowRatio: ratio, riskLevel, reasoning, recommendation });
}
