// One-off developer script — seeds the tax-invoice numbering counter so the
// first invoice generated in-app continues the studio's existing external
// numbering (last used: INV-000078) instead of starting over at 1.
// Refuses to run if the counter already exists, so it's safe to re-run by accident.
//
// Usage:
//   FIREBASE_SERVICE_ACCOUNT_KEY='<service-account-json>' npx tsx scripts/seedTaxInvoiceCounter.ts [startingSeq]
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

async function main() {
  const startingSeq = Number(process.argv[2] ?? 78);

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    console.error("Set FIREBASE_SERVICE_ACCOUNT_KEY to the service account JSON.");
    process.exit(1);
  }

  const app = initializeApp({ credential: cert(JSON.parse(raw)) });
  const db = getFirestore(app);

  const counterRef = db.collection("counters").doc("taxInvoices");
  const snap = await counterRef.get();
  if (snap.exists) {
    console.error(`counters/taxInvoices already exists (seq: ${snap.data()!.seq}). Refusing to overwrite.`);
    process.exit(1);
  }

  await counterRef.set({ seq: startingSeq });
  console.log(`Seeded counters/taxInvoices at seq ${startingSeq}. Next invoice will be INV-${String(startingSeq + 1).padStart(6, "0")}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
