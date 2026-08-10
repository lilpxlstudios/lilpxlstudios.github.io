import type { Proof } from "../types/order";

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Builds the selection CSV. Called server-side only (functions/src/selection) —
// keeping it in shared so an admin-side preview UI can render the same rows
// without re-implementing the format.
export function buildSelectionCsv(selectedProofs: Proof[]): string {
  const header = "fileName,driveFileId,selectedAt";
  const rows = selectedProofs.map((proof) => {
    const selectedAtIso = proof.selectedAt ? new Date(proof.selectedAt).toISOString() : "";
    return [proof.fileName, proof.driveFileId, selectedAtIso].map(escapeCsvField).join(",");
  });
  return [header, ...rows].join("\n");
}
