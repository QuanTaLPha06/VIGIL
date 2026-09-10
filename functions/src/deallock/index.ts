import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db, COLLECTIONS } from "../lib/firebase-admin";
import { addRiskEvent } from "../risk/index";

// ── syncDealLockEvent ─────────────────────────────────────────
/**
 * Called by the frontend after a blockchain transaction to sync
 * the on-chain state into Firestore and update the risk profile.
 */
export const syncDealLockEvent = onCall(async (request) => {
  const { dealId, eventType, txHash } = request.data as {
    dealId: string;
    eventType: "CREATED" | "CONFIRMED" | "BREACHED" | "COMPLETED";
    txHash?: string;
  };
  const userId = request.auth?.uid;

  if (!dealId || !eventType) {
    throw new HttpsError("invalid-argument", "dealId and eventType are required.");
  }

  const dealRef = db.collection(COLLECTIONS.DEALS).doc(dealId);
  const dealSnap = await dealRef.get();

  if (!dealSnap.exists) {
    throw new HttpsError("not-found", `Deal ${dealId} not found.`);
  }

  const deal = dealSnap.data()!;

  // ── Map event → status ────────────────────────────────────
  const statusMap: Record<string, string> = {
    CREATED: "LOCKED",
    CONFIRMED: "CONFIRMED",
    BREACHED: "BREACHED",
    COMPLETED: "COMPLETED",
  };

  await dealRef.update({
    status: statusMap[eventType] || deal.status,
    ...(txHash && { blockchainTxHash: txHash }),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // ── Feed into risk engine ─────────────────────────────────
  const companyId = userId || deal.buyerId;
  if (companyId) {
    const riskEventMap: Record<string, string> = {
      CREATED: "DEALLOCK_ACTIVATED",
      CONFIRMED: "DEALLOCK_ACTIVATED",
      BREACHED: "DEALLOCK_BREACH",
      COMPLETED: "DEALLOCK_COMPLETED",
    };

    const riskEvent = riskEventMap[eventType];
    if (riskEvent) {
      await addRiskEvent({
        companyId,
        eventType: riskEvent,
        source: "deallock",
        evidence: [
          `Deal with ${deal.sellerName || "counterparty"}`,
          `Amount: ${deal.amount} MATIC`,
          txHash ? `Tx: ${txHash.slice(0, 18)}…` : "On-chain event",
        ],
      });
    }

    // If breach, also create a case automatically
    if (eventType === "BREACHED") {
      await db.collection(COLLECTIONS.CASES).add({
        companyId,
        type: "DEALLOCK_BREACH",
        status: "OPEN",
        dealId,
        amount: deal.amount,
        description: `DealLock breach — ${deal.sellerName || "counterparty"}`,
        dueDate: deal.paymentDeadline || null,
        daysOverdue: 0,
        evidence: [
          "Original deal terms",
          "Blockchain timestamp",
          "Terms hash",
          txHash ? "Transaction proof" : null,
        ].filter(Boolean),
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  }

  return { success: true, status: statusMap[eventType] };
});
