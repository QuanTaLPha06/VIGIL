import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, COLLECTIONS } from "../lib/firebase-admin";
import { generateText } from "../lib/gemini";

// ── calculateInterest ─────────────────────────────────────────
/**
 * Calculates statutory interest under the MSMED Act.
 * Rate: 3× the RBI bank rate (currently ~6.5% → 19.5% p.a.)
 *
 * MSMED Act 2006, Section 16:
 * Interest = Principal × Rate × Days / 365
 *
 * This is an ESTIMATOR — not legal advice.
 */
export const calculateInterest = onCall(async (request) => {
  const { principal, daysOverdue, rbiRate } = request.data as {
    principal: number;
    daysOverdue: number;
    rbiRate: number;
  };

  if (!principal || !daysOverdue || !rbiRate) {
    throw new HttpsError("invalid-argument", "principal, daysOverdue and rbiRate are required.");
  }
  if (principal <= 0 || daysOverdue <= 0 || rbiRate <= 0) {
    throw new HttpsError("invalid-argument", "All values must be positive.");
  }

  // MSMED Act: 3× RBI bank rate
  const applicableRate = rbiRate * 3;
  const interest = Math.round((principal * applicableRate * daysOverdue) / (100 * 365));
  const totalClaim = principal + interest;

  const breakdown = [
    `Principal: ₹${principal.toLocaleString("en-IN")}`,
    `Days overdue: ${daysOverdue}`,
    `RBI bank rate: ${rbiRate}% → Applicable rate (3×): ${applicableRate}%`,
    `Formula: ₹${principal.toLocaleString("en-IN")} × ${applicableRate}% × ${daysOverdue}/365`,
    `Estimated interest: ₹${interest.toLocaleString("en-IN")}`,
    `Total claim: ₹${totalClaim.toLocaleString("en-IN")}`,
    "Note: Verify against current RBI bank rate and applicable statutory provisions.",
  ].join("\n");

  return { interest, totalClaim, breakdown };
});

// ── generateSamadhaanDraft ────────────────────────────────────
/**
 * Generates a pre-filled MSME Samadhaan complaint draft.
 * Uses AI to structure the available case evidence.
 * Output is a text draft — user submits via the official portal.
 */
export const generateSamadhaanDraft = onCall(async (request) => {
  const { caseId } = request.data as { caseId: string };

  if (!caseId) {
    throw new HttpsError("invalid-argument", "caseId is required.");
  }

  const caseSnap = await db.collection(COLLECTIONS.CASES).doc(caseId).get();
  if (!caseSnap.exists) {
    throw new HttpsError("not-found", "Case not found.");
  }

  const caseData = caseSnap.data()!;

  const prompt = `You are helping an Indian MSME prepare a complaint draft for the MSME Samadhaan portal (samadhaan.msme.gov.in).

Generate a formal complaint draft based on this case data:
- Case type: ${caseData.type}
- Amount: ₹${caseData.amount?.toLocaleString("en-IN") || "Not specified"}
- Due date: ${caseData.dueDate || "Not specified"}
- Days overdue: ${caseData.daysOverdue || "Not specified"}
- Description: ${caseData.description || "Payment dispute"}
- Evidence available: ${(caseData.evidence || []).join(", ")}

Write a professional complaint draft with:
1. Subject line
2. Facts of the case (numbered)
3. Relief sought
4. Declaration

Keep it factual, formal, and under 300 words. Use Indian English. Do NOT include real personal details — use [BUYER NAME], [SELLER NAME], [ADDRESS] as placeholders.`;

  let draft = "";

  try {
    draft = await generateText(prompt);
  } catch {
    // Fallback template if Gemini unavailable
    draft = `COMPLAINT UNDER MSMED ACT 2006 — SECTION 17

To,
The Facilitation Council / MSME Samadhaan Portal

Subject: Complaint for recovery of delayed payment

FACTS:
1. The applicant [BUYER NAME] is an MSME registered under the MSMED Act 2006.
2. A transaction of ₹${caseData.amount?.toLocaleString("en-IN") || "[AMOUNT]"} was agreed upon with [SELLER NAME] for supply of goods/services.
3. The due date for payment was ${caseData.dueDate || "[DUE DATE]"}.
4. Despite repeated follow-ups, the payment has not been made as of the date of this complaint.
5. The delay is currently ${caseData.daysOverdue || "[DAYS]"} days beyond the agreed date.

RELIEF SOUGHT:
1. Recovery of principal amount of ₹${caseData.amount?.toLocaleString("en-IN") || "[AMOUNT]"}.
2. Statutory interest at the applicable rate under Section 16 of the MSMED Act.
3. Any other relief deemed fit.

DECLARATION:
I declare that the facts stated above are true to the best of my knowledge.

[BUYER NAME]
[DATE]
[CONTACT]

---
Note: This is a pre-filled draft. Verify all details and submit via samadhaan.msme.gov.in.
This is not legal advice.`;
  }

  return {
    draft,
    fileName: `samadhaan-draft-${caseId.slice(-6)}.txt`,
  };
});
