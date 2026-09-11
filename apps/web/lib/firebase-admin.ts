/**
 * Firebase Admin SDK — server-side only.
 * Used by Next.js API routes (app/api/*).
 * Never import this in client components.
 */

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  // Production: GOOGLE_APPLICATION_CREDENTIALS env var points to service account JSON
  // OR set individual env vars (easier for Vercel deployment)
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY &&
    projectId
  ) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ?.replace(/\\n/g, "\n")   // handle escaped newlines from env vars
          .replace(/^"|"$/g, ""),   // strip surrounding quotes if any
      }),
    });
  }

  // Local dev with emulator or application default credentials
  return initializeApp({ projectId });
}

export const adminApp = getAdminApp();
export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);

// ── Collection names ─────────────────────────────────────────
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

// ── Auth helper — verify Firebase ID token from request ──────
export async function verifyAuthToken(
  request: Request
): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.split("Bearer ")[1];
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

// ── Standard JSON responses ───────────────────────────────────
export function ok(data: unknown) {
  return Response.json(data, { status: 200 });
}

export function err(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
