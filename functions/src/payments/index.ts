import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db, COLLECTIONS } from "../lib/firebase-admin";
import { addRiskEvent } from "../risk/index";

interface PaymentRiskRequest {
  amount: number;
  monthlyOutflow: number;
  counterparty?: string;
  purpose?: string;
}

// ── assessPaymentRisk ─────────────────────────────────────────
export const assessPaymentRisk = onCall(async (request) => {
  const { amount, monthlyOutflow, counterparty, purpose } =
    request.data as PaymentRiskRequest;
  const userId = request.auth?.uid;

  if (!amount || !monthlyOutflow) {
    throw new HttpsError("invalid-argument", "amount and monthlyOutflow are required.");
  }
  if (amount <= 0 || monthlyOutflow <= 0) {
    throw new HttpsError("invalid-argument", "Values must be positive.");
  }

  const ratio = (amount / monthlyOutflow) * 100;

  // ── Risk classification ────────────────────────────────────
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  let reasoning: string;
  let recommendation: string;
  let eventType: string | null = null;

  if (ratio < 15) {
    riskLevel = "LOW";
    reasoning = `Payment of ₹${amount.toLocaleString("en-IN")} is ${ratio.toFixed(1)}% of your monthly outflow — within normal range.`;
    recommendation = "Proceed with standard due diligence.";
  } else if (ratio < 30) {
    riskLevel = "MEDIUM";
    reasoning = `Payment is ${ratio.toFixed(1)}% of monthly outflow — moderately elevated. Verify counterparty before paying.`;
    recommendation = "Verify the counterparty via Watchtower before proceeding.";
  } else if (ratio < 50) {
    riskLevel = "HIGH";
    reasoning = `Payment is ${ratio.toFixed(1)}% of monthly outflow — significant proportion. High review recommended.`;
    recommendation = "Do not pay without completing Watchtower verification and reviewing the invoice carefully.";
    eventType = "HIGH_VALUE_PAYMENT";
  } else {
    riskLevel = "CRITICAL";
    reasoning = `Payment is ${ratio.toFixed(1)}% of monthly outflow — exceptionally large. This is unusual and requires maximum scrutiny.`;
    recommendation = "Pause this payment. Independently verify the request, confirm the invoice, and consider DealLock protection.";
    eventType = "HIGH_VALUE_PAYMENT";
  }

  // ── Store the assessment ───────────────────────────────────
  const docRef = await db.collection(COLLECTIONS.PAYMENTS).add({
    userId: userId || null,
    companyId: userId || null,
    amount,
    monthlyOutflow,
    outflowRatio: ratio,
    riskLevel,
    reasoning,
    recommendation,
    counterparty: counterparty || null,
    purpose: purpose || null,
    createdAt: FieldValue.serverTimestamp(),
  });

  // ── Feed into risk engine ──────────────────────────────────
  if (userId && eventType) {
    await addRiskEvent({
      companyId: userId,
      eventType,
      source: "payment-assessor",
      evidence: [
        `Payment ₹${amount.toLocaleString("en-IN")} is ${ratio.toFixed(1)}% of monthly outflow`,
        counterparty ? `Counterparty: ${counterparty}` : "Counterparty not verified",
      ],
    });
  }

  return {
    id: docRef.id,
    amount,
    monthlyOutflow,
    outflowRatio: ratio,
    riskLevel,
    reasoning,
    recommendation,
  };
});
