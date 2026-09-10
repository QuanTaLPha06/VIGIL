export const RISK_LEVELS = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export const DEAL_STATUS = {
  LOCKED: "LOCKED",
  CONFIRMED: "CONFIRMED",
  BREACHED: "BREACHED",
  COMPLETED: "COMPLETED",
  DISPUTED: "DISPUTED",
  CANCELLED: "CANCELLED",
} as const;

export const CASE_TYPES = {
  SCAM: "SCAM",
  SUSPICIOUS_PAYMENT: "SUSPICIOUS_PAYMENT",
  DELAYED_PAYMENT: "DELAYED_PAYMENT",
  DEALLOCK_BREACH: "DEALLOCK_BREACH",
  COUNTERPARTY_DISPUTE: "COUNTERPARTY_DISPUTE",
} as const;

export const RISK_THRESHOLDS = {
  LOW_MAX: 29,
  MEDIUM_MAX: 54,
  HIGH_MAX: 74,
  CRITICAL_MIN: 75,
} as const;

// MSMED Act — payment delay threshold for Samadhaan eligibility
export const MSMED_DELAY_THRESHOLD_DAYS = 45;

// Default RBI bank rate for interest calculation (update periodically)
export const DEFAULT_RBI_RATE = 6.5;

export const NETWORK = {
  BASE_SEPOLIA: "base-sepolia",
  HARDHAT_LOCAL: "hardhat",
} as const;

export const COLLECTIONS = {
  USERS: "users",
  COMPANIES: "companies",
  RISK_PROFILES: "riskProfiles",
  RISK_EVENTS: "riskEvents",
  PAYMENTS: "payments",
  SCAM_REPORTS: "scamReports",
  DEALS: "deals",
  CASES: "cases",
  INVESTMENT_PROFILES: "investmentProfiles",
  VERIFICATION_CHECKS: "verificationChecks",
} as const;
