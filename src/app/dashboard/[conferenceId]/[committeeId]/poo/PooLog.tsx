"use client";

import { useTransition } from "react";
import { deletePoo } from "./actions";

type PooEntry = {
  id: string;
  poNumber: number;
  score: number;
  raisedDuring: string;
  comments: string | null;
  country: { name: string };
};

export function PooLog({
  conferenceId,
  committeeId,
  entries,
}: {
  conferenceId: string;
  committeeId: string;
  entries: PooEntry[];
}) {
  const [, startTransition] = useTransition();

  if (entries.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-serif font-semibold text-ink mb-3">PoO Log</h2>
      <div className="space-y-2">
        {[...entries].reverse().map((entry) => (
          <div
            key={entry.id}
            className="bg-panel border border-line rounded-shell shadow-sm px-4 py-3 flex items-start justify-between gap-4"
          >
            <div className="text-sm">
              <span className="font-semibold text-primary-deep">PoO {entry.poNumber}</span>{" "}
              <span className="font-medium text-ink">{entry.country.name}</span>{" "}
              <span className="text-muted">— scored {entry.score}/3, raised during the speech of {entry.raisedDuring}</span>
              {entry.comments && (
                <p className="text-muted mt-1 italic">"{entry.comments}"</p>
              )}
            </div>
            <button
              onClick={() =>
                startTransition(() => deletePoo(conferenceId, committeeId, entry.id))
              }
              className="text-danger hover:underline text-xs font-medium shrink-0"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}