"use client";

import { useActionState, useEffect, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { clientDb } from "@/lib/firebase/client";
import { completeSelection, type CompleteSelectionState } from "@/lib/actions/selection";
import type { Proof } from "@lps/shared";

const initialActionState: CompleteSelectionState = { status: "idle" };

export function SelectionGrid({ orderId, initialProofs }: { orderId: string; initialProofs: Proof[] }) {
  const [proofs, setProofs] = useState<Proof[]>(initialProofs);
  const boundComplete = completeSelection.bind(null, orderId);
  const [actionState, submitCompletion, pending] = useActionState(boundComplete, initialActionState);

  useEffect(() => {
    const q = query(collection(clientDb, "orders", orderId, "proofs"), orderBy("index"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setProofs(snap.docs.map((d) => d.data() as Proof));
    });
    return unsubscribe;
  }, [orderId]);

  // Only ever invoked from the onClick below, never during render — Date.now()
  // here is safe despite the compiler's static purity check.
  async function toggle(proof: Proof) {
    const proofRef = doc(clientDb, "orders", orderId, "proofs", proof.id);
    const willBeSelected = !proof.selected;
    // eslint-disable-next-line react-hooks/purity
    const selectedAt = willBeSelected ? Date.now() : null;
    await updateDoc(proofRef, { selected: willBeSelected, selectedAt });
  }

  const selectedCount = proofs.filter((p) => p.selected).length;

  if (actionState.status === "success") {
    return (
      <div className="border border-success-500 rounded-md p-4">
        <p>Submitted! You selected {actionState.count} photos.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {proofs.map((proof) => (
          <button
            key={proof.id}
            type="button"
            onClick={() => toggle(proof)}
            className={`relative aspect-square rounded-md overflow-hidden border-2 ${
              proof.selected ? "border-accent-500" : "border-transparent"
            }`}
          >
            {proof.thumbUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={proof.thumbUrl} alt={proof.fileName} className="w-full h-full object-cover" />
            )}
            <span
              className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                proof.selected ? "bg-accent-500 text-paper-50" : "bg-paper-50/80 text-ink-500"
              }`}
            >
              {proof.selected ? "✓" : ""}
            </span>
          </button>
        ))}
      </div>

      <div className="sticky bottom-4 flex items-center justify-between bg-paper-50 border border-ink-100 rounded-md px-4 py-3">
        <p className="text-sm">
          {selectedCount} of {proofs.length} selected
        </p>
        <form action={submitCompletion}>
          <button
            type="submit"
            disabled={pending || selectedCount === 0}
            className="bg-ink-900 text-paper-50 rounded-md px-4 py-2 text-sm disabled:opacity-50"
          >
            {pending ? "Submitting…" : "Submit selection"}
          </button>
        </form>
      </div>
      {actionState.status === "error" && <p className="text-sm text-danger-500">{actionState.message}</p>}
    </div>
  );
}
