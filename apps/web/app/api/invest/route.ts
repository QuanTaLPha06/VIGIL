/**
 * POST /api/invest
 * Calculates cyber-risk-adjusted capital allocation guidance.
 * Educational only — not regulated investment advice.
 */

import { NextRequest } from "next/server";
import { adminDb, verifyAuthToken, ok, err, COLLECTIONS } from "@/lib/firebase-admin";

const RISK_RESERVE_PERCENT: Record<string, number> = {
  LOW: 5, MEDIUM: 15, HIGH: 30, CRITICAL: 50,
};

const ALLOCATION_BANDS: Record<string, Array<{ category: string; minPercent: number; maxPercent: number; rationale: string }>> = {
  HIGH: [
    { category: "Liquid funds / overnight funds",  minPercent: 60, maxPercent: 80, rationale: "Immediate access; minimal lock-in" },
    { category: "Short-duration debt instruments", minPercent: 20, maxPercent: 40, rationale: "Slightly higher return; <1yr maturity" },
  ],
  MEDIUM: [
    { category: "Liquid / ultra-short funds",      minPercent: 40, maxPercent: 60, rationale: "Maintain core liquidity buffer" },
    { category: "Short-duration debt instruments", minPercent: 30, maxPercent: 40, rationale: "Moderate term for improved yield" },
    { category: "Conservative hybrid instruments", minPercent: 10, maxPercent: 20, rationale: "Small diversification allocation" },
  ],
  LOW: [
    { category: "Liquid funds",                         minPercent: 20, maxPercent: 30, rationale: "Maintain minimum emergency buffer" },
    { category: "Short to medium debt instruments",     minPercent: 40, maxPercent: 50, rationale: "Core deployment allocation" },
    { category: "Conservative hybrid instruments",      minPercent: 20, maxPercent: 30, rationale: "Balanced return profile" },
  ],
};

function calcStatus(score: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (score < 30) return "LOW";
  if (score < 55) return "MEDIUM";
  if (score < 75) return "HIGH";
  return "CRITICAL";
}

export async function POST(req: NextRequest) {
  const uid = await verifyAuthToken(req);
  if (!uid) return err("Unauthorized", 401);

  const body = await req.json().catch(() => ({}));
  const { availableCash, workingCapitalBuffer, upcomingObligations } = body as {
    availableCash: number;
    workingCapitalBuffer: number;
    upcomingObligations: number;
  };

  if (availableCash === undefined || workingCapitalBuffer === undefined || upcomingObligations === undefined) {
    return err("availableCash, workingCapitalBuffer and upcomingObligations are required");
  }

  // Fetch current risk score
  let overallRisk = 0;
  const profileSnap = await adminDb.collection(COLLECTIONS.RISK_PROFILES).doc(uid).get();
  if (profileSnap.exists) overallRisk = (profileSnap.data()?.overallRisk as number) || 0;

  const riskStatus = calcStatus(overallRisk);
  const reservePct = RISK_RESERVE_PERCENT[riskStatus];
  const preSurplus = availableCash - workingCapitalBuffer - upcomingObligations;
  const cyberRiskReserve = Math.max(0, Math.round((preSurplus * reservePct) / 100));
  const deployableSurplus = Math.max(0, preSurplus - cyberRiskReserve);

  const liquidityPriority: "HIGH" | "MEDIUM" | "LOW" =
    riskStatus === "CRITICAL" || riskStatus === "HIGH" ? "HIGH"
    : riskStatus === "MEDIUM" ? "MEDIUM" : "LOW";

  const allocationBands = deployableSurplus > 0 ? ALLOCATION_BANDS[liquidityPriority] : [];

  // Save profile
  await adminDb.collection(COLLECTIONS.INVESTMENT_PROFILES).doc(uid).set(
    { userId: uid, availableCash, workingCapitalBuffer, upcomingObligations, cyberRiskReserve, deployableSurplus, overallRisk, riskStatus, liquidityPriority, updatedAt: new Date().toISOString() },
    { merge: true }
  );

  return ok({
    availableCash, workingCapitalBuffer, upcomingObligations,
    cyberRiskReserve, deployableSurplus, overallRisk, riskStatus,
    liquidityPriority, allocationBands,
    disclaimer: "Educational guidance only. Not individualized investment advice. Consult a SEBI-registered adviser before making investment decisions.",
  });
}
