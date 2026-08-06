import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">
        Sign in to Little Pixel Studios
      </h1>
      <p className="text-ink-500 text-sm max-w-sm text-center">
        Client accounts are set up by the studio — check your email for a
        first-login link if this is your first visit.
      </p>
      <LoginForm />
    </main>
  );
}
