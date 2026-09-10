/**
 * Firebase Cloud Functions callable client.
 * All calls to backend logic go through here.
 */

import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";
import type {
  ScamAnalysisRequest,
  ScamAnalysisResult,
  VerificationRequest,
  VerificationResult,
  PaymentRiskRequest,
  PaymentRiskResult,
  InvestmentAllocationRequest,
  InvestmentAllocationResult,
  RiskRecalculateResult,
} from "@vigil/types";

// ── Scam Checker ─────────────────────────────────────────────
export const analyzeScam = httpsCallable<ScamAnalysisRequest, ScamAnalysisResult>(
  functions,
  "analyzeScam"
);

// ── Company Watchtower ───────────────────────────────────────
export const verifyCompany = httpsCallable<VerificationRequest, VerificationResult>(
  functions,
  "verifyCompany"
);

// ── Payment Risk ─────────────────────────────────────────────
export const assessPaymentRisk = httpsCallable<PaymentRiskRequest, PaymentRiskResult>(
  functions,
  "assessPaymentRisk"
);

// ── Risk Engine ──────────────────────────────────────────────
export const recalculateRisk = httpsCallable<{ companyId: string }, RiskRecalculateResult>(
  functions,
  "recalculateRisk"
);

export const simulateRiskEvent = httpsCallable<
  { companyId: string; eventType: string },
  { newRisk: number; delta: number }
>(functions, "simulateRiskEvent");

// ── VIGIL Invest ─────────────────────────────────────────────
export const calculateAllocation = httpsCallable<
  InvestmentAllocationRequest,
  InvestmentAllocationResult
>(functions, "calculateAllocation");

export const checkInvestmentScheme = httpsCallable<
  { schemeName: string; organizationName: string },
  VerificationResult
>(functions, "checkInvestmentScheme");

// ── Cases ─────────────────────────────────────────────────────
export const generateSamadhaanDraft = httpsCallable<
  { caseId: string },
  { draft: string; fileName: string }
>(functions, "generateSamadhaanDraft");

export const calculateInterest = httpsCallable<
  { principal: number; daysOverdue: number; rbiRate: number },
  { interest: number; totalClaim: number; breakdown: string }
>(functions, "calculateInterest");
