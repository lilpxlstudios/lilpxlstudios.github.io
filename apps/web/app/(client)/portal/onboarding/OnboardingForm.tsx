"use client";

import { useActionState } from "react";
import { submitOnboarding, skipOnboarding, type OnboardingState } from "@/lib/actions/onboarding";
import { PACKAGE_OPTIONS } from "@lps/shared";

const initialState: OnboardingState = { status: "idle" };

export function OnboardingForm() {
  const [state, action, pending] = useActionState(submitOnboarding, initialState);

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="packagePreference" className="text-sm text-ink-700">
            Which package are you interested in? (optional)
          </label>
          <select
            id="packagePreference"
            name="packagePreference"
            defaultValue=""
            className="border border-ink-100 rounded-md px-3 py-2"
          >
            <option value="">Not sure yet</option>
            {PACKAGE_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="preferredShootDate" className="text-sm text-ink-700">
            Preferred shoot date (optional)
          </label>
          <input
            id="preferredShootDate"
            name="preferredShootDate"
            type="date"
            className="border border-ink-100 rounded-md px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="notes" className="text-sm text-ink-700">
            Anything else we should know? (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Themes, props, locations, timing preferences…"
            className="border border-ink-100 rounded-md px-3 py-2"
          />
        </div>

        {state.status === "error" && <p className="text-sm text-danger-500">{state.message}</p>}

        <button
          type="submit"
          disabled={pending}
          className="self-start bg-ink-900 text-paper-50 rounded-md px-4 py-2 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save & continue"}
        </button>
      </form>

      <form action={skipOnboarding}>
        <button type="submit" className="text-sm text-ink-500 underline">
          Skip for now
        </button>
      </form>
    </div>
  );
}
