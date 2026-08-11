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

## Email (Resend)

Admin alerts (new inquiry, order selection completed), the newsletter double
opt-in link, and any future client emails send via
[Resend](https://resend.com) (`functions/src/email.ts`). Until
littlepixelstudios.com is verified as a sending domain in Resend (M7), mail
sends from Resend's shared `onboarding@resend.dev` address, which only
delivers to the Resend account's own inbox — fine for dev/testing, not for
real recipients.

Set the secret before deploying or running the emulator:

```
firebase functions:secrets:set RESEND_API_KEY
```

For local emulator testing, put the same value in `functions/.secret.local`
(gitignored, read automatically by `firebase emulators:start`):

```
RESEND_API_KEY=re_your_key_here
```

## External accounts needed later (M7)

- Google Cloud service account with Drive API enabled — for proof-photo syncing
- Anthropic API key — for the marketing content-drafting helper
- Domain DNS access for littlepixelstudios.com — for final hosting, verified
  Resend sending domain, and email auth records
