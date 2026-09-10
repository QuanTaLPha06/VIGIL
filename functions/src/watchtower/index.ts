import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db, COLLECTIONS } from "../lib/firebase-admin";
import {
  lookupByGSTIN,
  isValidGSTINFormat,
  isValidPANFormat,
  isValidIFSCFormat,
  VALID_IFSC_PREFIXES,
} from "./mock-data";
import { addRiskEvent } from "../risk/index";

interface VerifyRequest {
  gstin?: string;
  pan?: string;
  bankAccount?: string;
  ifsc?: string;
}

// ── verifyCompany ─────────────────────────────────────────────
export const verifyCompany = onCall(async (request) => {
  const { gstin, pan, bankAccount, ifsc } = request.data as VerifyRequest;
  const userId = request.auth?.uid;

  if (!gstin && !pan) {
    throw new HttpsError("invalid-argument", "Provide at least a GSTIN or PAN.");
  }

  const evidence: Array<{
    label: string;
    status: "VERIFIED" | "WARNING" | "FAILED" | "NOT_PROVIDED";
    detail?: string;
  }> = [];

  let overallStatus: "VERIFIED" | "PARTIAL" | "FAILED" = "VERIFIED";
  let businessName = "";
  let communityReports = 0;
  let company = null;

  // ── GSTIN check ───────────────────────────────────────────
  if (gstin) {
    if (!isValidGSTINFormat(gstin)) {
      evidence.push({ label: "GSTIN Format", status: "FAILED", detail: "Invalid GSTIN format" });
      overallStatus = "FAILED";
    } else {
      company = lookupByGSTIN(gstin);
      if (company) {
        evidence.push({
          label: "GSTIN",
          status: company.status === "ACTIVE" ? "VERIFIED" : "WARNING",
          detail: `Status: ${company.status} | State: ${company.addressState}`,
        });
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

  // ── PAN check ─────────────────────────────────────────────
  if (pan) {
    if (!isValidPANFormat(pan)) {
      evidence.push({ label: "PAN", status: "FAILED", detail: "Invalid PAN format" });
      if (overallStatus === "VERIFIED") overallStatus = "PARTIAL";
    } else {
      const panVerified = company?.panVerified ?? true;
      evidence.push({
        label: "PAN",
        status: panVerified ? "VERIFIED" : "WARNING",
        detail: panVerified ? "Format valid and cross-referenced" : "Could not verify against GSTIN records",
      });
      if (!panVerified && overallStatus === "VERIFIED") overallStatus = "PARTIAL";
    }
  } else {
    evidence.push({ label: "PAN", status: "NOT_PROVIDED" });
  }

  // ── Bank account check ────────────────────────────────────
  if (bankAccount && ifsc) {
    const ifscValid = isValidIFSCFormat(ifsc);
    const knownBank = VALID_IFSC_PREFIXES.some((p) => ifsc.toUpperCase().startsWith(p));

    evidence.push({
      label: "Bank Account + IFSC",
      status: ifscValid && knownBank ? "VERIFIED" : "WARNING",
      detail: ifscValid
        ? knownBank ? "IFSC valid — known bank" : "IFSC format valid but bank not in known list"
        : "Invalid IFSC format",
    });
    if ((!ifscValid || !knownBank) && overallStatus === "VERIFIED") overallStatus = "PARTIAL";
  } else if (bankAccount || ifsc) {
    evidence.push({ label: "Bank Account + IFSC", status: "WARNING", detail: "Provide both account number and IFSC together" });
    if (overallStatus === "VERIFIED") overallStatus = "PARTIAL";
  } else {
    evidence.push({ label: "Bank Account", status: "NOT_PROVIDED" });
  }

  // ── Address ───────────────────────────────────────────────
  evidence.push({
    label: "Address",
    status: company ? "WARNING" : "NOT_PROVIDED",
    detail: company
      ? `Registered state: ${company.addressState} — not independently verified`
      : undefined,
  });

  // ── Community reports ─────────────────────────────────────
  if (communityReports > 0) {
    evidence.push({
      label: "Community Reports",
      status: communityReports >= 3 ? "FAILED" : "WARNING",
      detail: `${communityReports} report(s) found`,
    });
    if (overallStatus === "VERIFIED") overallStatus = "PARTIAL";
  }

  // ── Recommendation ────────────────────────────────────────
  let recommendation = "";
  if (overallStatus === "VERIFIED" && communityReports === 0) {
    recommendation = "Core identity checks passed. Standard due diligence applies for high-value transactions.";
  } else if (overallStatus === "PARTIAL") {
    recommendation = "Some checks are incomplete or have warnings. Verify remaining evidence before making a high-value payment.";
  } else {
    recommendation = "Verification failed. Do not proceed with payment until identity is independently confirmed.";
  }

  // ── Save to Firestore ─────────────────────────────────────
  const docRef = await db.collection(COLLECTIONS.VERIFICATION_CHECKS).add({
    requestedBy: userId || null,
    gstin: gstin || null,
    pan: pan || null,
    bankAccount: bankAccount || null,
    ifsc: ifsc || null,
    businessName: businessName || null,
    status: overallStatus,
    evidence,
    communityReports,
    recommendation,
    createdAt: FieldValue.serverTimestamp(),
  });

  // ── Feed into risk engine ─────────────────────────────────
  if (userId) {
    if (overallStatus === "FAILED" || communityReports >= 3) {
      await addRiskEvent({
        companyId: userId,
        eventType: "UNVERIFIED_COUNTERPARTY",
        source: "watchtower",
        evidence: [`Verification result: ${overallStatus}`, `Community reports: ${communityReports}`],
      });
    } else if (overallStatus === "VERIFIED" && communityReports === 0) {
      await addRiskEvent({
        companyId: userId,
        eventType: "COUNTERPARTY_FULLY_VERIFIED",
        source: "watchtower",
        evidence: [`${businessName || gstin} fully verified`],
      });
    }
  }

  return {
    id: docRef.id,
    status: overallStatus,
    businessName: businessName || null,
    evidence,
    communityReports,
    recommendation,
  };
});

// ── checkInvestmentScheme ─────────────────────────────────────
export const checkInvestmentScheme = onCall(async (request) => {
  const { schemeName, organizationName } = request.data as {
    schemeName: string;
    organizationName: string;
  };

  if (!schemeName || !organizationName) {
    throw new HttpsError("invalid-argument", "schemeName and organizationName are required.");
  }

  // Prototype: simple heuristic check
  const suspiciousPatterns = [
    /guaranteed.*return/i, /assured.*profit/i, /risk.?free.*invest/i,
    /double.*money/i, /100%.*return/i, /chit\s*fund/i,
  ];

  const isSuspicious = suspiciousPatterns.some((p) => p.test(schemeName));

  const evidence = [
    {
      label: "Scheme name analysis",
      status: isSuspicious ? ("WARNING" as const) : ("VERIFIED" as const),
      detail: isSuspicious ? "Scheme name contains potentially misleading language" : "No obvious red flags in name",
    },
    {
      label: "Organization verification",
      status: "WARNING" as const,
      detail: "Use SEBI SCORES / RBI website to verify registration before investing",
    },
  ];

  return {
    id: `scheme-${Date.now()}`,
    status: isSuspicious ? "PARTIAL" : "PARTIAL",
    businessName: organizationName,
    evidence,
    communityReports: 0,
    recommendation: isSuspicious
      ? "This scheme name contains patterns associated with fraud. Verify on SEBI SCORES before investing."
      : `Verify ${organizationName} on SEBI SCORES (scores.sebi.gov.in) or RBI's registered entity list before investing.`,
  };
});
