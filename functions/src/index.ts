/**
 * VIGIL — Firebase Cloud Functions
 * Central export file. Each module exports its own callable functions.
 *
 * Deployed via: firebase deploy --only functions
 * Local dev:    firebase emulators:start --only functions
 */

import { initializeApp } from "firebase-admin/app";

// Initialize Firebase Admin once at the top level
initializeApp();

// ── Risk Engine ─────────────────────────────────────────────
export {
  recalculateRisk,
  simulateRiskEvent,
  getRiskTrend,
} from "./risk/index";

// ── Company Watchtower ───────────────────────────────────────
export { verifyCompany, checkInvestmentScheme } from "./watchtower/index";

// ── Scam Checker ─────────────────────────────────────────────
export { analyzeScam } from "./scam-checker/index";

// ── Payment Risk ─────────────────────────────────────────────
export { assessPaymentRisk } from "./payments/index";

// ── DealLock ─────────────────────────────────────────────────
export { syncDealLockEvent } from "./deallock/index";

// ── Cases ─────────────────────────────────────────────────────
export {
  generateSamadhaanDraft,
  calculateInterest,
} from "./cases/index";

// ── VIGIL Invest ─────────────────────────────────────────────
export { calculateAllocation } from "./invest/index";
