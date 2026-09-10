/**
 * Firestore collection helpers.
 * All reads/writes go through these helpers to keep
 * collection names consistent across the app.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Collection names ────────────────────────────────────────
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

// ── Generic helpers ─────────────────────────────────────────

export const getDocument = async <T>(
  collectionName: string,
  docId: string
): Promise<T | null> => {
  const ref = doc(db, collectionName, docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
};

export const setDocument = async <T extends object>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> => {
  await setDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const addDocument = async <T extends object>(
  collectionName: string,
  data: T
): Promise<string> => {
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateDocument = async <T extends object>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> => {
  await updateDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const queryDocuments = async <T>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> => {
  const q = query(collection(db, collectionName), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
};

// ── Risk-specific helpers ───────────────────────────────────

export const getRiskProfile = (companyId: string) =>
  getDocument(COLLECTIONS.RISK_PROFILES, companyId);

export const getRiskEvents = (companyId: string, limitCount = 20) =>
  queryDocuments(
    COLLECTIONS.RISK_EVENTS,
    where("companyId", "==", companyId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

export const subscribeToRiskProfile = (
  companyId: string,
  callback: (profile: unknown) => void
) => {
  const ref = doc(db, COLLECTIONS.RISK_PROFILES, companyId);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
};

export const subscribeToRiskEvents = (
  companyId: string,
  callback: (events: unknown[]) => void
) => {
  const q = query(
    collection(db, COLLECTIONS.RISK_EVENTS),
    where("companyId", "==", companyId),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ── Deal helpers ────────────────────────────────────────────

export const getDeals = (companyId: string) =>
  queryDocuments(
    COLLECTIONS.DEALS,
    where("buyerId", "==", companyId),
    orderBy("createdAt", "desc")
  );

// ── Case helpers ────────────────────────────────────────────

export const getCases = (companyId: string) =>
  queryDocuments(
    COLLECTIONS.CASES,
    where("companyId", "==", companyId),
    orderBy("createdAt", "desc")
  );

export { serverTimestamp, Timestamp, where, orderBy, limit };
