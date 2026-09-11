/**
 * POST /api/cases
 * action=interest    — calculate MSMED Act statutory interest
 * action=samadhaan   — generate Samadhaan complaint draft
 */

import { NextRequest } from "next/server";
import { adminDb, verifyAuthToken, ok, err, COLLECTIONS } from "@/lib/firebase-admin";
import { generateText } from "@/lib/groq-server";

export async function POST(req: NextRequest) {
  const uid = await verifyAuthToken(req);
  if (!uid) return err("Unauthorized", 401);

  const body = await req.json().catch(() => ({}));
  const { action } = body as { action: "interest" | "samadhaan" };

  // ── Interest Calculator ───────────────────────────────────
  if (action === "interest") {
    const { principal, daysOverdue, rbiRate } = body as {
      principal: number;
      daysOverdue: number;
      rbiRate: number;
    };

    if (!principal || !daysOverdue || !rbiRate) return err("principal, daysOverdue and rbiRate are required");
    if (principal <= 0 || daysOverdue <= 0 || rbiRate <= 0) return err("All values must be positive");

    // MSMED Act Section 16: 3× RBI bank rate
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

    return ok({ interest, totalClaim, breakdown });
  }

  // ── Samadhaan Draft ──────────────────────────────────────
  if (action === "samadhaan") {
    const { caseId } = body as { caseId: string };
    if (!caseId) return err("caseId is required");

    const caseSnap = await adminDb.collection(COLLECTIONS.CASES).doc(caseId).get();
    if (!caseSnap.exists) return err("Case not found", 404);

    const c = caseSnap.data()!;

    const prompt = `Generate a formal MSME Samadhaan complaint draft based on:
- Type: ${c.type}
- Amount: ₹${c.amount?.toLocaleString("en-IN") || "not specified"}
- Due date: ${c.dueDate || "not specified"}
- Days overdue: ${c.daysOverdue || "not specified"}
- Description: ${c.description || "Payment dispute"}
- Evidence: ${(c.evidence || []).join(", ")}

Write a professional complaint with subject line, numbered facts, relief sought, and declaration.
Under 300 words. Use [BUYER NAME], [SELLER NAME], [ADDRESS] as placeholders. Not legal advice.`;

    let draft = "";
    try {
      draft = await generateText(prompt);
    } catch {
      draft = `COMPLAINT UNDER MSMED ACT 2006 — SECTION 17

To,
The Facilitation Council / MSME Samadhaan Portal

Subject: Complaint for recovery of delayed payment

FACTS:
1. The applicant [BUYER NAME] is an MSME registered under the MSMED Act 2006.
2. A transaction of ₹${c.amount?.toLocaleString("en-IN") || "[AMOUNT]"} was agreed with [SELLER NAME].
3. The payment due date was ${c.dueDate || "[DUE DATE]"}.
4. Despite follow-ups, payment has not been received.
5. The delay is currently ${c.daysOverdue || "[DAYS]"} days beyond the agreed date.

RELIEF SOUGHT:
1. Recovery of principal: ₹${c.amount?.toLocaleString("en-IN") || "[AMOUNT]"}.
2. Statutory interest under Section 16 of the MSMED Act.

DECLARATION:
I declare the above facts are true to the best of my knowledge.

[BUYER NAME] | [DATE] | [CONTACT]

---
Submit via: samadhaan.msme.gov.in
This draft is not legal advice.`;
    }

    return ok({ draft, fileName: `samadhaan-draft-${caseId.slice(-6)}.txt` });
  }

  return err("Invalid action. Use interest or samadhaan.");
}
