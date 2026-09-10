/**
 * VIGIL — Demo Reset
 * Deletes all demo data from Firestore (emulator only).
 * Use before re-seeding for a clean demo state.
 */

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp({ projectId: "vigil-prototype" });
const db = getFirestore();

const COLLECTIONS = [
  "users", "riskProfiles", "riskEvents",
  "verificationChecks", "scamReports", "payments",
  "deals", "cases", "investmentProfiles",
];

async function deleteCollection(name: string) {
  const snap = await db.collection(name).limit(100).get();
  if (snap.empty) return;
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  console.log(`🗑  Deleted ${snap.size} docs from ${name}`);
}

async function reset() {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    console.error("❌ Only run against the emulator. Set FIRESTORE_EMULATOR_HOST first.");
    process.exit(1);
  }

  console.log("🔄 Resetting demo data...\n");
  for (const col of COLLECTIONS) {
    await deleteCollection(col);
  }
  console.log("\n✅ Reset complete. Run seed-demo-data.ts to repopulate.");
}

reset().catch(console.error);
