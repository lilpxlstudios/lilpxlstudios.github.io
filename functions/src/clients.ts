import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions/v2";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import "./admin";

const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

// Permanently removes client accounts soft-deleted more than 60 days ago
// (see apps/web/lib/actions/clients.ts's deleteClient/restoreClient). Only
// the Auth account and users/{uid} profile are purged — orders, payments,
// and invoices are left intact for accounting continuity.
export const purgeDeletedClients = onSchedule({ schedule: "every 24 hours", region: "asia-south1" }, async () => {
  const db = getFirestore();
  const auth = getAuth();
  const cutoff = Date.now() - SIXTY_DAYS_MS;

  const snap = await db.collection("users").where("role", "==", "client").where("deletedAt", "<=", cutoff).get();
  if (snap.empty) return;

  await Promise.all(
    snap.docs.map(async (doc) => {
      await auth.deleteUser(doc.id).catch((err) => logger.warn(`purgeDeletedClients: auth delete failed for ${doc.id}`, err));
      await doc.ref.delete();
    })
  );

  logger.info(`purgeDeletedClients: purged ${snap.size} client(s)`);
});
