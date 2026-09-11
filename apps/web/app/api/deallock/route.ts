/**
 * POST /api/deallock
 * Syncs a blockchain DealLock event into Firestore and updates risk profile.
 */

import { NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, verifyAuthToken, ok, err, COLLECTIONS } from "@/lib/firebase-admin";
import { applyEvent, getEventDelta, INITIAL_RISK_PROFILE } from "@/lib/risk-calculator";

const STATUS_MAP: Record<string, string> = {
  CREATED: "LOCKED",
  CONFIRMED: "CONFIRMED",
  BREACHED: "BREACHED",
  COMPLETED: "COMPLETED",
};

const RISK_EVENT_MAP: Record<string, string> = {
  CREATED: "DEALLOCK_ACTIVATED",
  CONFIRMED: "DEALLOCK_ACTIVATED",
  BREACHED: "DEALLOCK_BREACH",
  COMPLETED: "DEALLOCK_COMPLETED",
};

export async function POST(req: NextRequest) {
  const uid = await verifyAuthToken(req);
  if (!uid) return err("Unauthorized", 401);

  const body = await req.json().catch(() => ({}));
  const { dealId, eventType, txHash } = body as {
    dealId: string;
    eventType: "CREATED" | "CONFIRMED" | "BREACHED" | "COMPLETED";
    txHash?: string;
  };

  if (!dealId || !eventType) return err("dealId and eventType are required");

  const dealRef = adminDb.collection(COLLECTIONS.DEALS).doc(dealId);
  const dealSnap = await dealRef.get();
  if (!dealSnap.exists) return err("Deal not found", 404);

  const deal = dealSnap.data()!;
  const newStatus = STATUS_MAP[eventType] || deal.status;

  await dealRef.update({
    status: newStatus,
    ...(txHash && { blockchainTxHash: txHash }),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Update risk profile
  const riskEvent = RISK_EVENT_MAP[eventType];
  if (riskEvent) {
    const companyId = uid || deal.buyerId;
    const delta = getEventDelta(riskEvent);
    const severity = Math.abs(delta) >= 15 ? "HIGH" : Math.abs(delta) >= 10 ? "MEDIUM" : "LOW";
    const profileSnap = await adminDb.collection(COLLECTIONS.RISK_PROFILES).doc(companyId).get();
    const current = profileSnap.exists ? profileSnap.data() : { ...INITIAL_RISK_PROFILE };

    await Promise.all([
      adminDb.collection(COLLECTIONS.RISK_EVENTS).add({
        companyId, eventType: riskEvent, severity, source: "deallock", scoreDelta: delta,
        evidence: [`Deal with ${deal.sellerName || "counterparty"}`, `Amount: ${deal.amount} ETH`, txHash ? `Tx: ${txHash.slice(0, 18)}…` : "On-chain event"],
        createdAt: FieldValue.serverTimestamp(),
      }),
      adminDb.collection(COLLECTIONS.RISK_PROFILES).doc(companyId).set(
        { ...applyEvent(current as Parameters<typeof applyEvent>[0], riskEvent), companyId, updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      ),
    ]);

    // Auto-create case on breach
    if (eventType === "BREACHED") {
      await adminDb.collection(COLLECTIONS.CASES).add({
        companyId,
        type: "DEALLOCK_BREACH",
        status: "OPEN",
        dealId,
        amount: deal.amount,
        description: `DealLock breach — ${deal.sellerName || "counterparty"}`,
        dueDate: deal.paymentDeadline || null,
        daysOverdue: 0,
        evidence: ["Original deal terms", "Blockchain timestamp", "Terms hash", txHash ? "Transaction proof" : null].filter(Boolean),
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  }

  return ok({ success: true, status: newStatus });
}
