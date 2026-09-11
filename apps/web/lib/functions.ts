/**
 * VIGIL API client — replaces Firebase callable functions.
 * All calls go to Next.js API routes (/api/*).
 * Auth token is automatically attached from Firebase Auth.
 */

import { auth } from "./firebase";
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

// ── Base fetch helper ─────────────────────────────────────────
async function apiCall<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

async function apiGet<T>(endpoint: string): Promise<T> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();

  const res = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Scam Checker ──────────────────────────────────────────────
export const analyzeScam = (data: ScamAnalysisRequest) =>
  apiCall<ScamAnalysisResult>("/api/scam", data as unknown as Record<string, unknown>).then((data) => ({ data }));

// ── Company Watchtower ────────────────────────────────────────
export const verifyCompany = (data: VerificationRequest) =>
  apiCall<VerificationResult>("/api/watchtower", data as unknown as Record<string, unknown>).then((data) => ({ data }));

export const checkInvestmentScheme = (data: { schemeName: string; organizationName: string }) =>
  apiCall<VerificationResult>("/api/watchtower", { ...data, action: "scheme" }).then((data) => ({ data }));

// ── Payment Risk ──────────────────────────────────────────────
export const assessPaymentRisk = (data: PaymentRiskRequest) =>
  apiCall<PaymentRiskResult>("/api/payments", data as unknown as Record<string, unknown>).then((data) => ({ data }));

// ── Risk Engine ───────────────────────────────────────────────
export const recalculateRisk = (data: { companyId: string }) =>
  apiCall<RiskRecalculateResult>("/api/risk", { ...data, action: "recalculate" }).then((data) => ({ data }));

export const simulateRiskEvent = (data: { companyId: string; eventType: string }) =>
  apiCall<{ newRisk: number; delta: number }>("/api/risk", { ...data, action: "simulate" }).then((data) => ({ data }));

export const getRiskTrend = () =>
  apiGet<{ points: unknown[] }>("/api/risk?action=trend").then((data) => ({ data }));

// ── VIGIL Invest ──────────────────────────────────────────────
export const calculateAllocation = (data: InvestmentAllocationRequest) =>
  apiCall<InvestmentAllocationResult>("/api/invest", data as unknown as Record<string, unknown>).then((data) => ({ data }));

// ── Cases ─────────────────────────────────────────────────────
export const generateSamadhaanDraft = (data: { caseId: string }) =>
  apiCall<{ draft: string; fileName: string }>("/api/cases", { ...data, action: "samadhaan" }).then((data) => ({ data }));

export const calculateInterest = (data: { principal: number; daysOverdue: number; rbiRate: number }) =>
  apiCall<{ interest: number; totalClaim: number; breakdown: string }>("/api/cases", { ...data, action: "interest" }).then((data) => ({ data }));

// ── DealLock sync ─────────────────────────────────────────────
export const syncDealLockEvent = (data: { dealId: string; eventType: string; txHash?: string }) =>
  apiCall<{ success: boolean; status: string }>("/api/deallock", data).then((data) => ({ data }));
