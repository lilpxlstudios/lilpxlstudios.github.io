# Little Pixel Studios

Monorepo for the Little Pixel Studios website (client portal, photo selection,
payments, invoicing) and, later, the React Native mobile apps.

## Structure

- `apps/web` — Next.js site (public pages, client portal, admin panel)
- `functions` — Firebase Cloud Functions (all business logic)
- `packages/shared` — Firestore types, business-logic helpers shared by web/functions/mobile
- `packages/design-tokens` — brand colors/spacing/typography, consumed by Tailwind now and RN later

## First-time setup

1. Install dependencies: `pnpm install`
2. Create a Firebase project at https://console.firebase.google.com (recommend a separate `-dev` project for local development).
3. Enable **Authentication** (Email/Password), **Firestore**, and **Storage** in that project.
4. Copy `apps/web/.env.local.example` to `apps/web/.env.local` and fill in the Firebase web app config (Project settings > General > Your apps) and a service account key (Project settings > Service accounts > Generate new private key — paste the JSON as one line into `FIREBASE_SERVICE_ACCOUNT_KEY`).
5. Run `firebase login`, then `firebase use --add` to link this repo to your Firebase project (creates `.firebaserc`, not committed by default — see `.gitignore` if you want it tracked).
6. Grant yourself the admin role: `pnpm set-admin-claim you@littlepixelstudios.com` (requires `FIREBASE_SERVICE_ACCOUNT_KEY` set in your shell).
7. Start the app: `pnpm dev` (runs `apps/web` on http://localhost:3000). For full local testing with Firestore/Auth/Storage/Functions emulators, run `pnpm emulators` in another terminal.

## External accounts needed later (M4–M7)

- Razorpay (test mode first) — for payments
- SendGrid — for admin alerts, client emails, and the newsletter
- Google Cloud service account with Drive API enabled — for proof-photo syncing
- Anthropic API key — for the marketing content-drafting helper
- Domain DNS access for littlepixelstudios.com — for final hosting + email auth records
