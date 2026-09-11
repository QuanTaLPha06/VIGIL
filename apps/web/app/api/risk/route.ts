/**
 * /api/risk
 * POST /api/risk/simulate  — add a risk event and update the profile
 * POST /api/risk/recalculate — replay all events and rebuild profile
 * GET  /api/risk/trend      — return last N events as trend points
 */

import { NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, verifyAuthToken, ok, err, COLLECTIONS } from "@/lib/firebase-admin";
import {
  applyEvent,
  getEventDelta,
  getEventReason,
  INITIAL_RISK_PROFILE,
  RISK_WEIGHTS,
  type RiskProfile,
} from "@/lib/risk-calculator";

// ── Helper: fetch or initialise risk profile ─────────────────
async function getProfile(companyId: string): Promise<RiskProfile> {
  const snap = await adminDb.collection(COLLECTIONS.RISK_PROFILES).doc(companyId).get();
  return snap.exists ? (snap.data() as RiskProfile) : { ...INITIAL_RISK_PROFILE };
}

// ── Helper: write risk event + updated profile ────────────────
async function writeRiskEvent(
  companyId: string,
  eventType: string,
  source: string,
  evidence: string[]
) {
  const delta = getEventDelta(eventType);
  const severity = Math.abs(delta) >= 15 ? "HIGH" : Math.abs(delta) >= 10 ? "MEDIUM" : "LOW";
  const current = await getProfile(companyId);
  const updated = applyEvent(current, eventType);

  await Promise.all([
    adminDb.collection(COLLECTIONS.RISK_EVENTS).add({
      companyId,
      eventType,
      severity,
      source,
      scoreDelta: delta,
      evidence,
      createdAt: FieldValue.serverTimestamp(),
    }),
    adminDb
      .collection(COLLECTIONS.RISK_PROFILES)
      .doc(companyId)
      .set({ ...updated, companyId, updatedAt: FieldValue.serverTimestamp() }, { merge: true }),
  ]);

  return { previous: current.overallRisk, updated };
}

// ── POST /api/risk ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const uid = await verifyAuthToken(req);
  if (!uid) return err("Unauthorized", 401);

  const body = await req.json().catch(() => ({}));
  const { action, eventType, companyId } = body as {
    action: "simulate" | "recalculate";
    eventType?: string;
    companyId?: string;
  };

  const targetId = companyId || uid;

  // ── simulate ────────────────────────────────────────────────
  if (action === "simulate") {
    if (!eventType || !RISK_WEIGHTS[eventType]) {
      return err(`Unknown eventType: ${eventType}`);
    }
    const { previous, updated } = await writeRiskEvent(
      targetId,
      eventType,
      "simulation",
      [getEventReason(eventType)]
    );
    return ok({
      previousRisk: previous,
      newRisk: updated.overallRisk,
      delta: getEventDelta(eventType),
      explanation: getEventReason(eventType),
    });
  }

  // ── recalculate ─────────────────────────────────────────────
  if (action === "recalculate") {
    const eventsSnap = await adminDb
      .collection(COLLECTIONS.RISK_EVENTS)
      .where("companyId", "==", targetId)
      .orderBy("createdAt", "asc")
      .get();

    let profile: RiskProfile = { ...INITIAL_RISK_PROFILE };
    eventsSnap.docs.forEach((d) => {
      profile = applyEvent(profile, d.data().eventType as string);
    });

    await adminDb
      .collection(COLLECTIONS.RISK_PROFILES)
      .doc(targetId)
      .set({ ...profile, companyId: targetId, updatedAt: FieldValue.serverTimestamp() }, { merge: true });

    return ok({ success: true, profile });
  }

  return err("Invalid action. Use simulate or recalculate.");
}

// ── GET /api/risk?action=trend ────────────────────────────────
export async function GET(req: NextRequest) {
  const uid = await verifyAuthToken(req);
  if (!uid) return err("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

  const snap = await adminDb
    .collection(COLLECTIONS.RISK_EVENTS)
    .where("companyId", "==", uid)
    .orderBy("createdAt", "asc")
    .limitToLast(limit)
    .get();

  let running = 0;
  const points = snap.docs.map((d) => {
    const e = d.data();
    running = Math.max(0, Math.min(100, running + (e.scoreDelta as number)));
    return { eventType: e.eventType, scoreDelta: e.scoreDelta, running, createdAt: e.createdAt };
  });

  return ok({ points });
}
