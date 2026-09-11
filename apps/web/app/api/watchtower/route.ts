/**
 * POST /api/watchtower          — verify a counterparty
 * POST /api/watchtower/scheme   — check an investment scheme
 */

import { NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, verifyAuthToken, ok, err, COLLECTIONS } from "@/lib/firebase-admin";
import { applyEvent, INITIAL_RISK_PROFILE } from "@/lib/risk-calculator";

// ── Mock company data (prototype) ─────────────────────────────
const MOCK_COMPANIES = [
  { gstin: "27AABCU9603R1ZP", businessName: "Sharma Textiles Pvt Ltd",   status: "ACTIVE",    panVerified: true,  addressState: "Maharashtra", communityReports: 0 },
  { gstin: "07AAACR5055K1ZB", businessName: "Raj Constructions",          status: "ACTIVE",    panVerified: true,  addressState: "Delhi",       communityReports: 2 },
  { gstin: "33AADCE4773M1Z5", businessName: "Chennai Components",         status: "SUSPENDED", panVerified: false, addressState: "Tamil Nadu",  communityReports: 5 },
  { gstin: "29AABCS1429B1Z2", businessName: "Bangalore Tech Solutions",   status: "ACTIVE",    panVerified: true,  addressState: "Karnataka",   communityReports: 0 },
  { gstin: "24AAGCA8719R1ZL", businessName: "Gujarat Agro Industries",    status: "ACTIVE",    panVerified: true,  addressState: "Gujarat",     communityReports: 1 },
];

const VALID_IFSC_PREFIXES = ["SBIN", "HDFC", "ICIC", "AXIS", "KKBK", "UBIN", "BARB"];

const isValidGSTIN = (g: string) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(g.toUpperCase());
const isValidPAN   = (p: string) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(p.toUpperCase());
const isValidIFSC  = (i: string) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(i.toUpperCase());

export async function POST(req: NextRequest) {
  const uid = await verifyAuthToken(req);
  if (!uid) return err("Unauthorized", 401);

  const body = await req.json().catch(() => ({}));
  const { gstin, pan, bankAccount, ifsc, action, schemeName, organizationName } = body as {
    gstin?: string; pan?: string; bankAccount?: string; ifsc?: string;
    action?: "scheme"; schemeName?: string; organizationName?: string;
  };

  // ── Scheme check ──────────────────────────────────────────
  if (action === "scheme") {
    if (!schemeName || !organizationName) return err("schemeName and organizationName required");
    const suspiciousPatterns = [/guaranteed.*return/i, /assured.*profit/i, /risk.?free.*invest/i, /double.*money/i, /100%.*return/i, /chit\s*fund/i];
    const isSuspicious = suspiciousPatterns.some((p) => p.test(schemeName));
    return ok({
      id: `scheme-${Date.now()}`,
      status: "PARTIAL",
      businessName: organizationName,
      evidence: [
        { label: "Scheme name analysis", status: isSuspicious ? "WARNING" : "VERIFIED", detail: isSuspicious ? "Name contains potentially misleading language" : "No obvious red flags in name" },
        { label: "Organization verification", status: "WARNING", detail: "Verify on SEBI SCORES (scores.sebi.gov.in) before investing" },
      ],
      communityReports: 0,
      recommendation: isSuspicious
        ? "Scheme name contains fraud patterns. Verify on SEBI SCORES before investing."
        : `Verify ${organizationName} on SEBI SCORES or RBI's registered entity list before investing.`,
    });
  }

  // ── Company verification ──────────────────────────────────
  if (!gstin && !pan) return err("Provide at least a GSTIN or PAN");

  const evidence: Array<{ label: string; status: string; detail?: string }> = [];
  let overallStatus: "VERIFIED" | "PARTIAL" | "FAILED" = "VERIFIED";
  let businessName = "";
  let communityReports = 0;
  let company = null;

  if (gstin) {
    if (!isValidGSTIN(gstin)) {
      evidence.push({ label: "GSTIN Format", status: "FAILED", detail: "Invalid GSTIN format" });
      overallStatus = "FAILED";
    } else {
      company = MOCK_COMPANIES.find((c) => c.gstin.toUpperCase() === gstin.toUpperCase()) ?? null;
      if (company) {
        evidence.push({ label: "GSTIN", status: company.status === "ACTIVE" ? "VERIFIED" : "WARNING", detail: `Status: ${company.status} | State: ${company.addressState}` });
        businessName = company.businessName;
        communityReports = company.communityReports;
        if (company.status !== "ACTIVE") overallStatus = "PARTIAL";
      } else {
        evidence.push({ label: "GSTIN", status: "WARNING", detail: "Not found in records — proceed with caution" });
        overallStatus = "PARTIAL";
      }
    }
  } else {
    evidence.push({ label: "GSTIN", status: "NOT_PROVIDED" });
  }

  if (pan) {
    const panVerified = company?.panVerified ?? true;
    evidence.push({ label: "PAN", status: !isValidPAN(pan) ? "FAILED" : panVerified ? "VERIFIED" : "WARNING", detail: isValidPAN(pan) ? (panVerified ? "Format valid and cross-referenced" : "Could not verify against GSTIN records") : "Invalid PAN format" });
    if (!isValidPAN(pan) && overallStatus === "VERIFIED") overallStatus = "PARTIAL";
  } else {
    evidence.push({ label: "PAN", status: "NOT_PROVIDED" });
  }

  if (bankAccount && ifsc) {
    const ifscValid = isValidIFSC(ifsc);
    const knownBank = VALID_IFSC_PREFIXES.some((p) => ifsc.toUpperCase().startsWith(p));
    evidence.push({ label: "Bank Account + IFSC", status: ifscValid && knownBank ? "VERIFIED" : "WARNING", detail: ifscValid ? (knownBank ? "IFSC valid — known bank" : "IFSC valid but bank not in known list") : "Invalid IFSC format" });
    if ((!ifscValid || !knownBank) && overallStatus === "VERIFIED") overallStatus = "PARTIAL";
  } else {
    evidence.push({ label: "Bank Account", status: "NOT_PROVIDED" });
  }

  evidence.push({ label: "Address", status: company ? "WARNING" : "NOT_PROVIDED", detail: company ? `Registered state: ${company.addressState} — not independently verified` : undefined });
  if (communityReports > 0) {
    evidence.push({ label: "Community Reports", status: communityReports >= 3 ? "FAILED" : "WARNING", detail: `${communityReports} report(s) found` });
    if (overallStatus === "VERIFIED") overallStatus = "PARTIAL";
  }

  const recommendation =
    overallStatus === "VERIFIED" && communityReports === 0
      ? "Core identity checks passed. Standard due diligence applies."
      : overallStatus === "PARTIAL"
      ? "Some checks are incomplete. Verify remaining evidence before a high-value payment."
      : "Verification failed. Do not proceed until identity is independently confirmed.";

  const ref = await adminDb.collection(COLLECTIONS.VERIFICATION_CHECKS).add({
    requestedBy: uid, gstin: gstin || null, pan: pan || null, bankAccount: bankAccount || null, ifsc: ifsc || null,
    businessName: businessName || null, status: overallStatus, evidence, communityReports, recommendation,
    createdAt: FieldValue.serverTimestamp(),
  });

  // Feed into risk engine
  const profileSnap = await adminDb.collection(COLLECTIONS.RISK_PROFILES).doc(uid).get();
  const current = profileSnap.exists ? profileSnap.data() : { ...INITIAL_RISK_PROFILE };
  const eventType = overallStatus === "FAILED" || communityReports >= 3 ? "UNVERIFIED_COUNTERPARTY" : overallStatus === "VERIFIED" && communityReports === 0 ? "COUNTERPARTY_FULLY_VERIFIED" : null;

  if (eventType) {
    const { getEventDelta, getEventReason } = await import("@/lib/risk-calculator");
    const delta = getEventDelta(eventType);
    await Promise.all([
      adminDb.collection(COLLECTIONS.RISK_EVENTS).add({ companyId: uid, eventType, severity: Math.abs(delta) >= 10 ? "MEDIUM" : "LOW", source: "watchtower", scoreDelta: delta, evidence: [getEventReason(eventType)], createdAt: FieldValue.serverTimestamp() }),
      adminDb.collection(COLLECTIONS.RISK_PROFILES).doc(uid).set({ ...applyEvent(current as Parameters<typeof applyEvent>[0], eventType), companyId: uid, updatedAt: FieldValue.serverTimestamp() }, { merge: true }),
    ]);
  }

  return ok({ id: ref.id, status: overallStatus, businessName: businessName || null, evidence, communityReports, recommendation });
}
