import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, COLLECTIONS } from "../lib/firebase-admin";
import { calcRiskStatus } from "../risk/calculator";

interface AllocationRequest {
  availableCash: number;
  workingCapitalBuffer: number;
  upcomingObligations: number;
}

// ── Allocation rules (educational, not regulated advice) ─────
// Risk reserve = % of deployable surplus held back due to cyber risk
const RISK_RESERVE_PERCENT: Record<string, number> = {
  LOW: 5,
  MEDIUM: 15,
  HIGH: 30,
  CRITICAL: 50,
};

// Educational allocation bands per liquidity priority
const ALLOCATION_BANDS: Record<
  string,
  Array<{ category: string; minPercent: number; maxPercent: number; rationale: string }>
> = {
  HIGH: [
    { category: "Liquid funds / overnight funds", minPercent: 60, maxPercent: 80, rationale: "Immediate access; minimal lock-in" },
    { category: "Short-duration debt instruments", minPercent: 20, maxPercent: 40, rationale: "Slightly higher return; <1yr maturity" },
  ],
  MEDIUM: [
    { category: "Liquid / ultra-short funds", minPercent: 40, maxPercent: 60, rationale: "Maintain core liquidity buffer" },
    { category: "Short-duration debt instruments", minPercent: 30, maxPercent: 40, rationale: "Moderate term for improved yield" },
    { category: "Conservative hybrid instruments", minPercent: 10, maxPercent: 20, rationale: "Small diversification allocation" },
  ],
  LOW: [
    { category: "Liquid funds", minPercent: 20, maxPercent: 30, rationale: "Maintain minimum emergency buffer" },
    { category: "Short to medium debt instruments", minPercent: 40, maxPercent: 50, rationale: "Core deployment allocation" },
    { category: "Conservative hybrid instruments", minPercent: 20, maxPercent: 30, rationale: "Balanced return profile" },
  ],
};

// ── calculateAllocation ───────────────────────────────────────
export const calculateAllocation = onCall(async (request) => {
  const { availableCash, workingCapitalBuffer, upcomingObligations } =
    request.data as AllocationRequest;
  const userId = request.auth?.uid;

  if (availableCash === undefined || workingCapitalBuffer === undefined || upcomingObligations === undefined) {
    throw new HttpsError("invalid-argument", "availableCash, workingCapitalBuffer and upcomingObligations are required.");
  }

  // Fetch current risk score
  let overallRisk = 0;
  if (userId) {
    const profileSnap = await db.collection(COLLECTIONS.RISK_PROFILES).doc(userId).get();
    if (profileSnap.exists) {
      overallRisk = (profileSnap.data()?.overallRisk as number) || 0;
    }
  }

  const riskStatus = calcRiskStatus(overallRisk);
  const reservePct = RISK_RESERVE_PERCENT[riskStatus];

  // ── Surplus calculation ────────────────────────────────────
  const preSurplus = availableCash - workingCapitalBuffer - upcomingObligations;
  const cyberRiskReserve = Math.max(0, Math.round((preSurplus * reservePct) / 100));
  const deployableSurplus = Math.max(0, preSurplus - cyberRiskReserve);

  // ── Liquidity priority ─────────────────────────────────────
  const liquidityPriority: "HIGH" | "MEDIUM" | "LOW" =
    riskStatus === "CRITICAL" || riskStatus === "HIGH"
      ? "HIGH"
      : riskStatus === "MEDIUM"
      ? "MEDIUM"
      : "LOW";

  const allocationBands = deployableSurplus > 0
    ? ALLOCATION_BANDS[liquidityPriority]
    : [];

  // Save the profile for history
  if (userId) {
    await db.collection(COLLECTIONS.INVESTMENT_PROFILES).doc(userId).set(
      {
        userId,
        availableCash,
        workingCapitalBuffer,
        upcomingObligations,
        cyberRiskReserve,
        deployableSurplus,
        overallRisk,
        riskStatus,
        liquidityPriority,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  return {
    availableCash,
    workingCapitalBuffer,
    upcomingObligations,
    cyberRiskReserve,
    deployableSurplus,
    overallRisk,
    riskStatus,
    liquidityPriority,
    allocationBands,
    disclaimer:
      "Educational guidance only. Not individualized investment advice. " +
      "Consult a SEBI-registered adviser before making investment decisions.",
  };
});
