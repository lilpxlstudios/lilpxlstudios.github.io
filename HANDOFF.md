# Little Pixel Studios — Handoff

Photography business platform for littlepixelstudios.com: marketing site, client portal, photo
selection/delivery, payments, invoicing. Originally built by Magesh Sadasivam under his personal
Google account (`smagesh9999@gmail.com`); mid-migration to a dedicated studio account
(`lilpxlstudios@gmail.com`) as of 2026-08-12, including switching which Claude account/machine
drives the work. **If you are a fresh Claude Code session picking this project up: read this whole
file before doing anything — it's written to be your onboarding context, since Claude's own memory
of this project is local to the original machine and does not travel with an account switch.**

## Continuing on a new machine, under the lilpxlstudios Claude account

1. Log into Claude Code with the `lilpxlstudios` Claude account.
2. Clone the repo and check out the active branch (main is an unrelated old static site):
   ```
   git clone git@github.com:lilpxlstudios/lilpxlstudios.github.io.git littlepixelstudios
   cd littlepixelstudios
   git checkout nextjs-rebuild
   ```
   If SSH isn't set up for GitHub on the new machine yet, use the HTTPS remote instead and
   authenticate when prompted (a GitHub account with Write access to
   `lilpxlstudios/lilpxlstudios.github.io` is required — the repo already lives under a
   `lilpxlstudios` GitHub account, so this should just be logging into that).
3. Install the Google Cloud SDK and Firebase CLI if not already present, then:
   ```
   gcloud auth login lilpxlstudios@gmail.com
   gcloud config set project littlepixelstudios-dev
   firebase login    # log in as lilpxlstudios@gmail.com when the browser opens
   ```
4. Install the Vercel CLI (or use `npx vercel`) and log in — the Vercel team
   (`lilpxlstudios-1430s-projects`) already appears to be a standalone account under the
   `lilpxlstudios` identity (its only member, confirmed 2026-08-12), not shared with `smagesh9999`,
   so this is likely just logging into an account you already own rather than requesting an invite.
   Then:
   ```
   npx vercel link       # link this checkout to the `web` project
   npx vercel env pull apps/web/.env.local
   ```
   This recreates all local secrets except Razorpay's (still unset everywhere — see Blockers).
5. `pnpm install && pnpm dev`, confirm `localhost:3000` loads.
6. Tell your new Claude session to treat this file as its starting context, and mention anything
   that's changed since 2026-08-12 that isn't reflected here yet.

## Account migration status (smagesh9999@gmail.com → lilpxlstudios@gmail.com)

- **GCP/Firebase project (`littlepixelstudios-dev`)**: `lilpxlstudios@gmail.com` has `roles/editor`
  and `roles/billing.projectManager` (the latter granted specifically so it can link/unlink the
  project's billing account without needing full Owner). `smagesh9999@gmail.com` remains
  `roles/owner` — a deliberate choice, not yet a full ownership transfer, to avoid lockout risk.
- **Billing**: still on the original billing account, owned solely by `smagesh9999@gmail.com`. Plan
  is a *new* Cloud Billing account under `lilpxlstudios@gmail.com` with its own payment method, then
  `gcloud billing projects link littlepixelstudios-dev --billing-account=<new-id>`. **Attempted
  2026-08-12, not completed**: `lilpxlstudios@gmail.com` is a brand-new Google Cloud identity (zero
  existing billing accounts, no Cloud Organization) and hit an unclear issue at
  `console.cloud.google.com/billing/create` — likely needs the account to complete Google Cloud's
  first-time welcome/verification flow (accept ToS, possibly phone/ID verification) before the
  normal "Create account" UI behaves as expected. Deferred by the owner to pick up later; not
  blocking anything else.
- **Vercel**: confirmed 2026-08-12 — the team's only member is the `lilpxlstudios-1430` identity,
  already separate from `smagesh9999`. Nothing to migrate here.
- **CLI logins on the original dev machine** (`/Users/mageshsadasivam/Documents/claude_projex/littlepixelstudios`):
  `gcloud` and local git commit identity were switched to `lilpxlstudios@gmail.com` on 2026-08-12.
  `firebase` CLI on that machine is still logged in as `smagesh9999@gmail.com` (not switched — low
  priority, only matters for direct `firebase deploy` from that machine).
- **GitHub**: the repo already lives under a `lilpxlstudios` GitHub account, not `smagesh9999` —
  nothing to move there. Historical commits keep `smagesh9999@gmail.com` as git author (not
  rewritten — that would rewrite already-pushed history).
- **Not yet checked**: Resend and Razorpay accounts, and the Squarespace domain-registrar account —
  confirm which email each is registered under.

## Get set up locally (general reference — see the numbered steps above for the new-machine path)

```
git clone git@github.com:lilpxlstudios/lilpxlstudios.github.io.git littlepixelstudios
cd littlepixelstudios
git checkout nextjs-rebuild   # this is the active branch, NOT main (main is the old static site)
pnpm install
```

Requires pnpm 9.15.0 (see `packageManager` in root `package.json`); Node 20 is what `functions/`
expects, though the repo builds fine under newer Node locally (Vercel's build image pins the
version it uses independently).

Once you have Vercel access:
```
npx vercel link       # link this checkout to the `web` project
npx vercel env pull apps/web/.env.local
```
This recreates all local secrets except Razorpay's (still unset anywhere — see Blockers).

Run locally: `pnpm dev` (turbo runs all workspace dev scripts; the web app is what you want, at
`localhost:3000`).

## Architecture

pnpm/Turborepo monorepo:
- `apps/web` — Next.js 16 App Router, the actual product (marketing site, admin panel, client
  portal). Deployed to Vercel.
- `functions` — Firebase Cloud Functions. Only used for things Server Actions can't do: Razorpay
  webhook (`functions/src/payments.ts`) and Firestore-triggered emails (`functions/src/marketing.ts`).
  Deployed separately via `firebase deploy`, not via Vercel.
- `packages/shared` — Firestore Zod schemas, order state machine, invoice numbering, shared
  package options. Consumed by both `apps/web` (via pnpm workspace) and `functions` (via a vendored
  copy, see Gotchas below).
- `packages/design-tokens` — brand tokens (colors/type) shared across web and future mobile apps.

Almost all business logic (order/client CRUD, payments, invoices, gallery sync) is implemented as
Next.js Server Actions in `apps/web/lib/actions/*.ts` using the Firebase Admin SDK directly — not
as Cloud Functions. This was a deliberate choice: Server Actions already run server-side, so there
was no reason to pay for a separate Functions deploy/emulator cycle for routine CRUD.

## Current status

**Done:** Firebase auth (session-cookie + DAL pattern), admin panel (client/order CRUD, Drive
proof sync), client portal + photo selection, CSV export, Razorpay payment integration (code
complete, see Blockers), invoice PDF generation, public marketing site with real photography,
pricing calculator, contact/newsletter forms with double opt-in, admin inquiry/subscriber views,
client onboarding flow, automated first-login email, client-facing delivery gallery (mirrors Drive
proofs into a `deliveryPhotos` subcollection, downloads proxied through the service account so the
Drive folder never needs to be public), forgot-password. Deployed to Vercel production, live at
`https://web-eta-jade-gu2vu0wxd1.vercel.app` (custom domain pending — see Blockers).

**Not started:** React Native mobile apps (planned after web ships).

## Blockers — the only two things standing between here and fully live

1. **Razorpay keys.** `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are blank everywhere (local
   `.env.local` and Vercel). Code is done and deployed. To unblock: get Test Mode keys from
   Razorpay Dashboard → Settings → API Keys, set them in Vercel env + local `.env.local`. A webhook
   also needs to be added in Razorpay Dashboard → Settings → Webhooks pointing at
   `https://razorpaywebhook-f2hpmfwsqa-el.a.run.app`, events `payment.captured` + `payment.failed`,
   secret `8941e38a6dabb4d1a2236ff7753926606a6df7855fcb15c2` (already stored in Firebase Secret
   Manager as `RAZORPAY_WEBHOOK_SECRET` for `littlepixelstudios-dev` — reuse it, don't regenerate).

2. **DNS.** `littlepixelstudios.com` is added to the Vercel project but still points at old
   nameservers. Owner manages the domain in Squarespace — needs two `A` records added
   (`@` → `76.76.21.21`, `www` → `76.76.21.21`) at Squarespace → Domains → littlepixelstudios.com →
   DNS Settings. Once that propagates, Vercel auto-verifies and issues SSL, no further action
   needed.

## Gotchas worth knowing before you touch things

- **`functions/vendor/lps-shared/` is generated, not committed.** `functions/package.json`
  depends on `@lps/shared` via `file:vendor/lps-shared` because plain `npm` (what Firebase's
  deploy uses remotely) doesn't understand pnpm's `workspace:*` protocol. That vendored copy is
  built by `functions/scripts/vendor-shared.sh`, which runs automatically as part of `functions`'
  own `build`/`typecheck` npm scripts — but if you ever see `pnpm install` fail with `ENOENT ...
  functions/vendor/lps-shared` on a totally fresh checkout in some *other* context (not Vercel —
  see next point), that's why.
- **Vercel's install is deliberately scoped.** Root `vercel.json` sets
  `installCommand: pnpm install --filter=@lps/web... --frozen-lockfile` specifically so Vercel's
  install never touches `functions/`'s workspace member (and thus never hits the vendored-dependency
  problem above). Don't remove this without understanding why it's there — a bare `pnpm install` at
  the repo root as Vercel's install command will fail on a fresh deploy. There's also a
  `.vercelignore` excluding `node_modules`/`.next`/`.turbo`/`.firebase` — without it a `vercel
  --prod` CLI deploy will try to upload the ~900MB root `node_modules` and hit Vercel's 100MB
  single-file limit.
- **Historical gitignore bug (fixed, but worth knowing):** an earlier version of `.gitignore` had a
  bare `lib/` pattern meant to ignore compiled output, which also matched real source dirs like
  `apps/web/lib/`. If you ever see this repo's history referenced and files seem "missing" before a
  certain commit, that's why — it's long since fixed (`.gitignore` now scopes to
  `/functions/lib/` and `/packages/shared/lib/` specifically).
- **`SITE_URL` env var** is used by `apps/web/lib/actions/clients.ts` to build the link in the
  automated first-login email. It's set in Vercel now (`https://littlepixelstudios.com`) — if it
  ever goes missing again, onboarding emails silently degrade to `localhost:3000` links.
- **Email sending** goes through Resend, wired directly in `apps/web/lib/email.ts` (client-creation
  emails) and separately in `functions/src/email.ts` (admin notification emails from Cloud
  Functions triggers) — two call sites, both real, neither stubbed.
- **Google service accounts have no Drive storage quota of their own.** Client Drive folders (for
  both proofs and delivery photos) must be shared with
  `firebase-adminsdk-fbsvc@littlepixelstudios-dev.iam.gserviceaccount.com` (Viewer) or sync will
  silently find nothing.

## Where to look for more context

Git log messages in this repo are written to double as documentation — they explain *why*, not
just *what*, for every non-trivial change. `git log --stat` on `nextjs-rebuild` is a reasonable way
to reconstruct history if something here is unclear or goes stale.
