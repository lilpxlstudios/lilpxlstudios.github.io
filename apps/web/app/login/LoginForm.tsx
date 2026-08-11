"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [mode, setMode] = useState<"signIn" | "reset">("signIn");
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const credential = await signInWithEmailAndPassword(clientAuth, email, password);
      const idToken = await credential.user.getIdToken();

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error("Could not sign in. Please try again.");
      }

      const { admin } = await response.json();
      router.push(admin ? "/admin" : "/portal");
      router.refresh();
    } catch {
      setError("Invalid email or password.");
    } finally {
      setPending(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      await sendPasswordResetEmail(clientAuth, email);
      setResetSent(true);
    } catch {
      // Don't reveal whether the email exists — same message either way.
      setResetSent(true);
    } finally {
      setPending(false);
    }
  }

  if (mode === "reset") {
    return (
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {resetSent ? (
          <p className="text-sm text-success-500">
            If an account exists for that email, a password reset link is on its way.
          </p>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="reset-email" className="text-sm text-ink-700">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-ink-100 rounded-md px-3 py-2"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="bg-ink-900 text-paper-50 rounded-md px-4 py-2 disabled:opacity-50"
            >
              {pending ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
        <button
          type="button"
          onClick={() => {
            setMode("signIn");
            setResetSent(false);
            setError(null);
          }}
          className="text-sm text-ink-500 underline self-start"
        >
          ← Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm text-ink-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-ink-100 rounded-md px-3 py-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm text-ink-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-ink-100 rounded-md px-3 py-2"
        />
      </div>
      {error && <p className="text-sm text-danger-500">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-ink-900 text-paper-50 rounded-md px-4 py-2 disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <button
        type="button"
        onClick={() => setMode("reset")}
        className="text-sm text-ink-500 underline self-start"
      >
        Forgot password?
      </button>
    </form>
  );
}
