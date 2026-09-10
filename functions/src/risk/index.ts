import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db, COLLECTIONS } from "../lib/firebase-admin";
import {
  applyEvent,
  getEventDelta,
  getEventExplanation,
  INITIAL_RISK_PROFILE,
  RISK_WEIGHTS,
  type RiskProfile,
} from "./calculator";

// ── recalculateRisk ──────────────────────────────────────────
/**
 * Recalculates the full risk profile from scratch by replaying
 * all stored risk events for the company.
 */
export const recalculateRisk = onCall(async (request) => {
  const { companyId } = request.data as { companyId: string };

  if (!companyId) {
    throw new HttpsError("invalid-argument", "companyId is required.");
  }

  // Fetch all events sorted oldest-first
  const eventsSnap = await db
    .collection(COLLECTIONS.RISK_EVENTS)
    .where("companyId", "==", companyId)
    .orderBy("createdAt", "asc")
    .get();

  // Replay events
  let profile: RiskProfile = { ...INITIAL_RISK_PROFILE };

  eventsSnap.docs.forEach((doc) => {
    const event = doc.data();
    profile = applyEvent(profile, event.eventType as string);
  });

  // Write updated profile
  await db
    .collection(COLLECTIONS.RISK_PROFILES)
    .doc(companyId)
    .set(
      {
        ...profile,
        companyId,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  return { success: true, profile };
});

// ── simulateRiskEvent ────────────────────────────────────────
/**
 * Adds a synthetic risk event and immediately updates the risk profile.
 * Used for the demo simulation on the dashboard.
 */
export const simulateRiskEvent = onCall(async (request) => {
  const { companyId, eventType } = request.data as {
    companyId: string;
    eventType: string;
  };

  if (!companyId || !eventType) {
    throw new HttpsError("invalid-argument", "companyId and eventType are required.");
  }

  if (!RISK_WEIGHTS[eventType]) {
    throw new HttpsError("invalid-argument", `Unknown eventType: ${eventType}`);
  }

  const delta = getEventDelta(eventType);
  const severity: "HIGH" | "MEDIUM" | "LOW" =
    Math.abs(delta) >= 15 ? "HIGH" : Math.abs(delta) >= 10 ? "MEDIUM" : "LOW";

  // Fetch current profile
  const profileRef = db.collection(COLLECTIONS.RISK_PROFILES).doc(companyId);
  const profileSnap = await profileRef.get();
  const currentProfile: RiskProfile = profileSnap.exists
    ? (profileSnap.data() as RiskProfile)
    : { ...INITIAL_RISK_PROFILE };

  // Apply the event
  const newProfile = applyEvent(currentProfile, eventType);

  // Write risk event
  const eventRef = await db.collection(COLLECTIONS.RISK_EVENTS).add({
    companyId,
    eventType,
    severity,
    source: "simulation",
    scoreDelta: delta,
    evidence: [getEventExplanation(eventType)],
    createdAt: FieldValue.serverTimestamp(),
  });

  // Update profile
  await profileRef.set(
    {
      ...newProfile,
      companyId,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return {
    eventId: eventRef.id,
    previousRisk: currentProfile.overallRisk,
    newRisk: newProfile.overallRisk,
    delta,
    explanation: getEventExplanation(eventType),
  };
});

// ── getRiskTrend ─────────────────────────────────────────────
/**
 * Returns the last N risk events with running totals for the trend chart.
 */
export const getRiskTrend = onCall(async (request) => {
  const { companyId, limit = 20 } = request.data as {
    companyId: string;
    limit?: number;
  };

  if (!companyId) {
    throw new HttpsError("invalid-argument", "companyId is required.");
  }

  const snap = await db
    .collection(COLLECTIONS.RISK_EVENTS)
    .where("companyId", "==", companyId)
    .orderBy("createdAt", "asc")
    .limitToLast(limit)
    .get();

  let running = 0;
  const points = snap.docs.map((doc) => {
    const e = doc.data();
    running = Math.max(0, Math.min(100, running + (e.scoreDelta as number)));
    return {
      eventType: e.eventType,
      scoreDelta: e.scoreDelta,
      running,
      createdAt: e.createdAt,
    };
  });

  return { points };
});

// ── Internal helper used by other modules ────────────────────
/**
 * Add a risk event from another function (e.g. scam-checker, payments).
 * Not exported as a Cloud Function — called internally.
 */
export async function addRiskEvent(params: {
  companyId: string;
  eventType: string;
  source: string;
  evidence: string[];
}): Promise<void> {
  const { companyId, eventType, source, evidence } = params;

  const delta = getEventDelta(eventType);
  if (delta === 0) return; // Unknown event type — skip

  const severity: "HIGH" | "MEDIUM" | "LOW" =
    Math.abs(delta) >= 15 ? "HIGH" : Math.abs(delta) >= 10 ? "MEDIUM" : "LOW";

  // Fetch current profile
  const profileRef = db.collection(COLLECTIONS.RISK_PROFILES).doc(companyId);
  const profileSnap = await profileRef.get();
  const currentProfile: RiskProfile = profileSnap.exists
    ? (profileSnap.data() as RiskProfile)
    : { ...INITIAL_RISK_PROFILE };

  const newProfile = applyEvent(currentProfile, eventType);

  // Write both in parallel
  await Promise.all([
    db.collection(COLLECTIONS.RISK_EVENTS).add({
      companyId,
      eventType,
      severity,
      source,
      scoreDelta: delta,
      evidence,
      createdAt: FieldValue.serverTimestamp(),
    }),
    profileRef.set(
      {
        ...newProfile,
        companyId,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    ),
  ]);
}
