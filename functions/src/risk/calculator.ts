/**
 * VIGIL Cyber Risk Calculator
 *
 * Explainable weighted model. Every change has a source and a reason.
 * The index is a risk-exposure indicator — not a credit score or legal finding.
 *
 * Score range: 0–100
 * Dimensions:  Identity, Transaction, Communication, Counterparty, Deal (20 pts each)
 */

export interface RiskDimensions {
  identityRisk: number;       // 0–20
  transactionRisk: number;    // 0–20
  communicationRisk: number;  // 0–20
  counterpartyRisk: number;   // 0–20
  dealRisk: number;           // 0–20
}

export interface RiskProfile extends RiskDimensions {
  overallRisk: number;        // 0–100
  trend: "IMPROVING" | "STABLE" | "DETERIORATING";
  status: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  previousRisk?: number;
}

// ── Risk weight table ───────────────────────────────────────
// Positive = increases risk, Negative = reduces risk
export const RISK_WEIGHTS: Record<string, { delta: number; dimension: keyof RiskDimensions; reason: string }> = {
  // Increases risk
  UNVERIFIED_COUNTERPARTY:      { delta: 10, dimension: "counterpartyRisk",   reason: "Counterparty verification incomplete" },
  SUSPICIOUS_MESSAGE:           { delta: 15, dimension: "communicationRisk",  reason: "Suspicious message detected" },
  HIGH_VALUE_PAYMENT:           { delta: 10, dimension: "transactionRisk",    reason: "High-value payment detected" },
  REPEATED_PAYMENT_ANOMALY:     { delta: 10, dimension: "transactionRisk",    reason: "Repeated payment anomalies detected" },
  DEALLOCK_BREACH:              { delta: 15, dimension: "dealRisk",           reason: "DealLock breach reported" },
  IDENTITY_UNVERIFIED:          { delta: 12, dimension: "identityRisk",       reason: "Business identity not fully verified" },
  SCAM_DETECTED:                { delta: 18, dimension: "communicationRisk",  reason: "Scam communication confirmed" },
  CASE_OPENED:                  { delta: 8,  dimension: "counterpartyRisk",   reason: "New fraud case opened" },
  PHISHING_ATTEMPT:             { delta: 14, dimension: "communicationRisk",  reason: "Phishing attempt detected" },
  INVOICE_ANOMALY:              { delta: 10, dimension: "transactionRisk",    reason: "Invoice anomaly detected" },

  // Reduces risk
  GSTIN_VERIFIED:               { delta: -5,  dimension: "identityRisk",      reason: "GST identity verified" },
  BANK_ACCOUNT_VERIFIED:        { delta: -5,  dimension: "counterpartyRisk",  reason: "Bank account verified" },
  DEALLOCK_ACTIVATED:           { delta: -8,  dimension: "dealRisk",          reason: "DealLock protection activated" },
  DEALLOCK_COMPLETED:           { delta: -10, dimension: "dealRisk",          reason: "Deal completed successfully with DealLock" },
  CASE_RESOLVED:                { delta: -6,  dimension: "counterpartyRisk",  reason: "Fraud case resolved" },
  PAYMENT_COMPLETED_SAFELY:     { delta: -5,  dimension: "transactionRisk",   reason: "Payment completed without incident" },
  COUNTERPARTY_FULLY_VERIFIED:  { delta: -8,  dimension: "counterpartyRisk",  reason: "Counterparty fully verified" },
};

/**
 * Clamp a dimension value between 0 and its max (20).
 */
export function clampDimension(value: number): number {
  return Math.max(0, Math.min(20, value));
}

/**
 * Calculate overall risk from dimensions.
 */
export function calcOverallRisk(dims: RiskDimensions): number {
  return Math.round(
    dims.identityRisk +
    dims.transactionRisk +
    dims.communicationRisk +
    dims.counterpartyRisk +
    dims.dealRisk
  );
}

/**
 * Determine risk status from score.
 */
export function calcRiskStatus(score: number): RiskProfile["status"] {
  if (score < 30) return "LOW";
  if (score < 55) return "MEDIUM";
  if (score < 75) return "HIGH";
  return "CRITICAL";
}

/**
 * Determine trend from previous vs current score.
 */
export function calcTrend(previous: number, current: number): RiskProfile["trend"] {
  const diff = current - previous;
  if (diff > 5) return "DETERIORATING";
  if (diff < -5) return "IMPROVING";
  return "STABLE";
}

/**
 * Apply a single risk event delta to a dimension profile.
 * Returns updated dimensions with the dimension clamped.
 */
export function applyEventToDimensions(
  dims: RiskDimensions,
  eventType: string
): RiskDimensions {
  const weight = RISK_WEIGHTS[eventType];
  if (!weight) return dims;

  return {
    ...dims,
    [weight.dimension]: clampDimension(dims[weight.dimension] + weight.delta),
  };
}

/**
 * Build a complete updated RiskProfile from current profile + event type.
 */
export function applyEvent(
  current: RiskProfile,
  eventType: string
): RiskProfile {
  const newDims = applyEventToDimensions(current, eventType);
  const newOverall = calcOverallRisk(newDims);

  return {
    ...newDims,
    overallRisk: newOverall,
    previousRisk: current.overallRisk,
    trend: calcTrend(current.overallRisk, newOverall),
    status: calcRiskStatus(newOverall),
  };
}

/**
 * Get the explanation for a risk event.
 */
export function getEventExplanation(eventType: string): string {
  return RISK_WEIGHTS[eventType]?.reason ?? eventType.replace(/_/g, " ").toLowerCase();
}

/**
 * Get the score delta for an event type.
 */
export function getEventDelta(eventType: string): number {
  return RISK_WEIGHTS[eventType]?.delta ?? 0;
}

/**
 * Empty/initial risk profile for a new company.
 */
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
