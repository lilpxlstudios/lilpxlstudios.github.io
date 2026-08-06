// One-off developer script — grants the `admin: true` custom claim to the studio
// owner's Firebase Auth account. Never expose this as an API endpoint.
//
// Usage:
//   FIREBASE_SERVICE_ACCOUNT_KEY='<service-account-json>' npx tsx scripts/setAdminClaim.ts owner@littlepixelstudios.com
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: tsx scripts/setAdminClaim.ts <email>");
    process.exit(1);
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    console.error("Set FIREBASE_SERVICE_ACCOUNT_KEY to the service account JSON.");
    process.exit(1);
  }

  const app = initializeApp({ credential: cert(JSON.parse(raw)) });
  const auth = getAuth(app);

  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { admin: true });

  console.log(`Granted admin claim to ${email} (uid: ${user.uid}).`);
  console.log("They must sign out and back in for the new claim to take effect.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
