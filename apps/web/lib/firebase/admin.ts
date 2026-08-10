import "server-only";
import { cert, getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Local dev: set FIREBASE_SERVICE_ACCOUNT_KEY to the service account JSON (as a string).
// Deployed on Firebase/GCP: omit it and applicationDefault() picks up the runtime's
// built-in service identity automatically.
function buildCredential() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (raw) {
    return cert(JSON.parse(raw));
  }
  return applicationDefault();
}

const app = getApps().length
  ? getApps()[0]!
  : initializeApp({
      credential: buildCredential(),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app);
