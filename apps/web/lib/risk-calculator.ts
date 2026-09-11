/**
 * VIGIL Risk Calculator — shared logic used by /api/risk route.
 * Identical to functions/src/risk/calculator.ts — single source of truth.
 */

export interface RiskDimensions {
  identityRisk: number;
  transactionRisk: number;
  communicationRisk: number;
  counterpartyRisk: number;
  dealRisk: number;
}

export interface RiskProfile extends RiskDimensions {
  overallRisk: number;
  trend: "IMPROVING" | "STABLE" | "DETERIORATING";
  status: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  previousRisk?: number;
}

export const RISK_WEIGHTS: Record<
  string,
  { delta: number; dimension: keyof RiskDimensions; reason: string }
> = {
  UNVERIFIED_COUNTERPARTY:     { delta: 10,  dimension: "counterpartyRisk",  reason: "Counterparty verification incomplete" },
  SUSPICIOUS_MESSAGE:          { delta: 15,  dimension: "communicationRisk", reason: "Suspicious message detected" },
  HIGH_VALUE_PAYMENT:          { delta: 10,  dimension: "transactionRisk",   reason: "High-value payment detected" },
  REPEATED_PAYMENT_ANOMALY:    { delta: 10,  dimension: "transactionRisk",   reason: "Repeated payment anomalies detected" },
  DEALLOCK_BREACH:             { delta: 15,  dimension: "dealRisk",          reason: "DealLock breach reported" },
  IDENTITY_UNVERIFIED:         { delta: 12,  dimension: "identityRisk",      reason: "Business identity not fully verified" },
  SCAM_DETECTED:               { delta: 18,  dimension: "communicationRisk", reason: "Scam communication confirmed" },
  CASE_OPENED:                 { delta: 8,   dimension: "counterpartyRisk",  reason: "New fraud case opened" },
  PHISHING_ATTEMPT:            { delta: 14,  dimension: "communicationRisk", reason: "Phishing attempt detected" },
  INVOICE_ANOMALY:             { delta: 10,  dimension: "transactionRisk",   reason: "Invoice anomaly detected" },
  GSTIN_VERIFIED:              { delta: -5,  dimension: "identityRisk",      reason: "GST identity verified" },
  BANK_ACCOUNT_VERIFIED:       { delta: -5,  dimension: "counterpartyRisk",  reason: "Bank account verified" },
  DEALLOCK_ACTIVATED:          { delta: -8,  dimension: "dealRisk",          reason: "DealLock protection activated" },
  DEALLOCK_COMPLETED:          { delta: -10, dimension: "dealRisk",          reason: "Deal completed successfully" },
  CASE_RESOLVED:               { delta: -6,  dimension: "counterpartyRisk",  reason: "Fraud case resolved" },
  PAYMENT_COMPLETED_SAFELY:    { delta: -5,  dimension: "transactionRisk",   reason: "Payment completed without incident" },
  COUNTERPARTY_FULLY_VERIFIED: { delta: -8,  dimension: "counterpartyRisk",  reason: "Counterparty fully verified" },
};

export const INITIAL_RISK_PROFILE: Omit<RiskProfile, "previousRisk"> = {
  identityRisk: 0,
  transactionRisk: 0,
  communicationRisk: 0,
  counterpartyRisk: 0,
  dealRisk: 0,
  overallRisk: 0,
  trend: "STABLE",
  status: "LOW",
};

export function clampDimension(v: number) {
  return Math.max(0, Math.min(20, v));
}

export function calcOverallRisk(d: RiskDimensions) {
  return Math.round(
    d.identityRisk + d.transactionRisk + d.communicationRisk +
    d.counterpartyRisk + d.dealRisk
  );
}

export function calcStatus(score: number): RiskProfile["status"] {
  if (score < 30) return "LOW";
  if (score < 55) return "MEDIUM";
  if (score < 75) return "HIGH";
  return "CRITICAL";
}

export function calcTrend(prev: number, curr: number): RiskProfile["trend"] {
  const diff = curr - prev;
  if (diff > 5) return "DETERIORATING";
  if (diff < -5) return "IMPROVING";
  return "STABLE";
}

export function applyEvent(current: RiskProfile, eventType: string): RiskProfile {
  const w = RISK_WEIGHTS[eventType];
  if (!w) return current;
  const newDims = {
    ...current,
    [w.dimension]: clampDimension(current[w.dimension] + w.delta),
  };
  const newOverall = calcOverallRisk(newDims);
  return {
    ...newDims,
    overallRisk: newOverall,
    previousRisk: current.overallRisk,
    trend: calcTrend(current.overallRisk, newOverall),
    status: calcStatus(newOverall),
  };
}

export function getEventDelta(eventType: string) {
  return RISK_WEIGHTS[eventType]?.delta ?? 0;
}

export function getEventReason(eventType: string) {
  return RISK_WEIGHTS[eventType]?.reason ?? eventType.replace(/_/g, " ").toLowerCase();
}
