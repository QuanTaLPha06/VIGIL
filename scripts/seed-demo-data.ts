/**
 * VIGIL — Demo Data Seed
 *
 * Populates Firestore with realistic demo data for the hackathon demo.
 * Run against the Firebase emulator or a dedicated demo project.
 *
 * Usage:
 *   firebase emulators:start   (in another terminal)
 *   ts-node scripts/seed-demo-data.ts
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import * as path from "path";

// Initialize with emulator or service account
const useEmulator = process.env.FIRESTORE_EMULATOR_HOST !== undefined;

if (useEmulator) {
  initializeApp({ projectId: "vigil-prototype" });
} else {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!serviceAccountPath) {
    console.error("Set GOOGLE_APPLICATION_CREDENTIALS or start the Firestore emulator.");
    process.exit(1);
  }
  initializeApp({ credential: cert(serviceAccountPath) });
}

const db = getFirestore();

// ── Demo user ─────────────────────────────────────────────────
const DEMO_USER_ID = "demo-user-sharma-enterprises";

const now = Timestamp.now();
const hoursAgo = (h: number) =>
  Timestamp.fromDate(new Date(Date.now() - h * 3600 * 1000));

async function seed() {
  console.log("🌱 Seeding VIGIL demo data...\n");

  // ── User ──────────────────────────────────────────────────
  await db.collection("users").doc(DEMO_USER_ID).set({
    uid: DEMO_USER_ID,
    name: "Priya Sharma",
    email: "demo@vigil.in",
    businessName: "Sharma Enterprises",
    createdAt: now,
    onboardingComplete: true,
  });
  console.log("✅ User created");

  // ── Risk events (builds a history) ──────────────────────────
  const riskEvents = [
    { eventType: "GSTIN_VERIFIED",       scoreDelta: -5,  severity: "LOW",    source: "watchtower",      evidence: ["Sharma Textiles GSTIN verified — ACTIVE"], hoursAgo: 48 },
    { eventType: "HIGH_VALUE_PAYMENT",   scoreDelta: 10,  severity: "MEDIUM", source: "payment-assessor",evidence: ["Payment ₹2,00,000 is 40% of monthly outflow"], hoursAgo: 36 },
    { eventType: "SUSPICIOUS_MESSAGE",   scoreDelta: 15,  severity: "HIGH",   source: "scam-checker",    evidence: ["Urgency tactics", "KYC impersonation", "OTP request"], hoursAgo: 24 },
    { eventType: "DEALLOCK_ACTIVATED",   scoreDelta: -8,  severity: "LOW",    source: "deallock",        evidence: ["Deal with Tech Supplies Ltd — 0.01 MATIC staked"], hoursAgo: 18 },
    { eventType: "UNVERIFIED_COUNTERPARTY", scoreDelta: 10, severity: "MEDIUM", source: "watchtower",   evidence: ["Raj Constructions — 2 community reports"], hoursAgo: 6 },
  ];

  for (const e of riskEvents) {
    await db.collection("riskEvents").add({
      companyId: DEMO_USER_ID,
      eventType: e.eventType,
      severity: e.severity,
      source: e.source,
      scoreDelta: e.scoreDelta,
      evidence: e.evidence,
      createdAt: hoursAgo(e.hoursAgo),
    });
  }
  console.log("✅ Risk events seeded");

  // ── Risk profile (calculated from events above) ───────────
  await db.collection("riskProfiles").doc(DEMO_USER_ID).set({
    companyId: DEMO_USER_ID,
    identityRisk: 0,
    transactionRisk: 10,
    communicationRisk: 15,
    counterpartyRisk: 5,
    dealRisk: 0,
    overallRisk: 30,
    trend: "DETERIORATING",
    status: "MEDIUM",
    updatedAt: now,
  });
  console.log("✅ Risk profile seeded (score: 30, MEDIUM)");

  // ── Verification checks ────────────────────────────────────
  await db.collection("verificationChecks").add({
    requestedBy: DEMO_USER_ID,
    gstin: "27AABCU9603R1ZP",
    businessName: "Sharma Textiles Pvt Ltd",
    status: "VERIFIED",
    communityReports: 0,
    recommendation: "Core identity checks passed. Standard due diligence applies.",
    evidence: [
      { label: "GSTIN", status: "VERIFIED", detail: "Status: ACTIVE | State: Maharashtra" },
      { label: "PAN", status: "VERIFIED", detail: "Format valid and cross-referenced" },
      { label: "Bank Account + IFSC", status: "VERIFIED", detail: "IFSC valid — known bank" },
    ],
    createdAt: hoursAgo(48),
  });

  await db.collection("verificationChecks").add({
    requestedBy: DEMO_USER_ID,
    gstin: "07AAACR5055K1ZB",
    businessName: "Raj Constructions",
    status: "PARTIAL",
    communityReports: 2,
    recommendation: "2 community reports found. Verify before high-value payment.",
    evidence: [
      { label: "GSTIN", status: "WARNING", detail: "Status: ACTIVE | 2 community reports" },
      { label: "PAN", status: "VERIFIED", detail: "Format valid" },
    ],
    createdAt: hoursAgo(6),
  });
  console.log("✅ Verification checks seeded");

  // ── Scam report ────────────────────────────────────────────
  await db.collection("scamReports").add({
    userId: DEMO_USER_ID,
    companyId: DEMO_USER_ID,
    text: "URGENT: Your KYC has expired. Click here immediately or your account will be blocked. Share your OTP to verify.",
    type: "MESSAGE",
    riskLevel: "HIGH",
    confidence: 0.94,
    signals: ["Urgency / pressure tactics", "KYC / identity impersonation language", "Request for sensitive information (OTP/PIN)"],
    ruleScore: 60,
    explanation: "This message exhibits classic KYC fraud patterns used to steal credentials from Indian MSME owners.",
    recommendedAction: "Do not share OTP. Verify directly with your bank via their official number.",
    createdAt: hoursAgo(24),
  });
  console.log("✅ Scam report seeded");

  // ── Payment assessment ─────────────────────────────────────
  await db.collection("payments").add({
    userId: DEMO_USER_ID,
    companyId: DEMO_USER_ID,
    amount: 200000,
    monthlyOutflow: 500000,
    outflowRatio: 40,
    riskLevel: "HIGH",
    reasoning: "Payment ₹2,00,000 is 40% of monthly outflow — significant proportion.",
    recommendation: "Verify the counterparty via Watchtower before proceeding.",
    counterparty: "Tech Supplies Ltd",
    purpose: "Invoice #INV-2026-089",
    createdAt: hoursAgo(36),
  });
  console.log("✅ Payment assessment seeded");

  // ── Deal ──────────────────────────────────────────────────
  const dealRef = await db.collection("deals").add({
    buyerId: DEMO_USER_ID,
    buyerName: "Priya Sharma",
    sellerName: "Tech Supplies Ltd",
    sellerAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    amount: 0.01,
    description: "Supply of 50 industrial components",
    paymentDeadline: "2026-09-30",
    penaltyPercent: 10,
    termsHash: "0xa3f8c2d1e4b7a9f0c5e2d8b1a4f7c0e3d6b9a2f5c8e1d4b7a0f3c6e9d2b5a8f1",
    blockchainTxHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    status: "LOCKED",
    network: "base-sepolia",
    createdAt: hoursAgo(18),
  });
  console.log("✅ Deal seeded:", dealRef.id);

  // ── Case ──────────────────────────────────────────────────
  await db.collection("cases").add({
    companyId: DEMO_USER_ID,
    type: "DELAYED_PAYMENT",
    status: "OPEN",
    description: "Delayed payment from Raj Constructions",
    amount: 150000,
    dueDate: "2026-07-26",
    daysOverdue: 45,
    evidence: [
      "Original deal terms",
      "Invoice #INV-2026-042",
      "Payment record",
      "Communication evidence",
    ],
    createdAt: hoursAgo(2),
  });
  console.log("✅ Case seeded");

  console.log("\n✅ Demo data seed complete!");
  console.log(`   Demo user ID: ${DEMO_USER_ID}`);
  console.log("   Login with: demo@vigil.in / demo123\n");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
