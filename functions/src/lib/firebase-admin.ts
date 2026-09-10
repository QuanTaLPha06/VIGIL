import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// firebase-admin app is initialized in index.ts before any module is imported
export const db = getFirestore();
export const auth = getAuth();

// ── Collection names (mirrors apps/web/lib/firestore.ts) ────
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
