"use client";

import { useState, useTransition } from "react";
import { createRollCallDays } from "./actions";

export function DaySetupForm({
  conferenceId,
  committeeId,
}: {
  conferenceId: string;
  committeeId: string;
}) {
  const [days, setDays] = useState(2);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="bg-panel border border-line rounded-shell shadow-sm p-6 max-w-md">
      <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-2">
        How many days will this committee run?
      </label>
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setDays(n)}
            className={`w-11 h-11 rounded-lg font-semibold border transition-colors ${
              days === n
                ? "bg-primary text-white border-primary"
                : "bg-white text-ink border-line2 hover:border-primary"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(() => createRollCallDays(conferenceId, committeeId, days))
        }
        className="w-full bg-primary hover:bg-primary-deep text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
      >
        Set Up {days} Day{days > 1 ? "s" : ""}
      </button>
    </div>
  );
}