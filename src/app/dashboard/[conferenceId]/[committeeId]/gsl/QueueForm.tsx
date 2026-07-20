"use client";

import { useTransition } from "react";
import { addToQueue, removeFromQueue } from "./actions";
import { CountryCombobox } from "./CountryCombobox";

type Country = { id: string; name: string };
type QueueEntry = {
  id: string;
  countryId: string;
  country: { name: string };
  gsl1Score: number | null;
  gsl2Score: number | null;
};

export function QueueForm({
  conferenceId,
  committeeId,
  countries,
  queue,
  variant = "compact",
}: {
  conferenceId: string;
  committeeId: string;
  countries: Country[];
  queue: QueueEntry[];
  variant?: "setup" | "compact";
}) {
  const [, startTransition] = useTransition();

  const queueMap = new Map(queue.map((q) => [q.countryId, q]));
  const options = countries.map((c) => {
    const entry = queueMap.get(c.id);
    const status: "new" | "queued" | "recognized" = !entry
      ? "new"
      : entry.gsl1Score != null
      ? "recognized"
      : "queued";
    return { id: c.id, name: c.name, status };
  });

  const handleSelect = (countryId: string) => {
    startTransition(() => {
      addToQueue(conferenceId, committeeId, countryId);
    });
  };

  if (variant === "setup") {
    return (
      <div className="max-w-xl mx-auto bg-panel border border-line rounded-shell shadow-sm p-8 fade-up">
        <h2 className="text-xl font-serif font-semibold text-ink mb-1">
          Build the Speaking Queue
        </h2>
        <p className="text-sm text-muted mb-5">
          Search and select countries in the order they'll speak. You can keep adding
          more at any time — this list never locks.
        </p>
        <CountryCombobox options={options} onSelect={handleSelect} />

        {queue.length > 0 && (
          <ol className="flex flex-wrap gap-2 mt-5">
            {queue.map((entry, i) => (
              <li
                key={entry.id}
                className="flex items-center gap-2 bg-wash border border-line rounded-full pl-3 pr-1.5 py-1 text-sm"
              >
                <span className="font-semibold text-muted">{i + 1}.</span>
                <span className="font-medium text-ink">{entry.country.name}</span>
                <button
                  onClick={() =>
                    startTransition(() =>
                      removeFromQueue(conferenceId, committeeId, entry.id)
                    )
                  }
                  className="text-muted hover:text-danger w-5 h-5 rounded-full grid place-items-center text-xs"
                >
                  ✕
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    );
  }

  return (
    <div className="relative z-30 bg-panel border border-line rounded-shell shadow-sm p-4 mb-6 fade-up max-w-md">
      <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-2">
        Add another speaker
      </label>
      <CountryCombobox options={options} onSelect={handleSelect} />
    </div>
  );
}