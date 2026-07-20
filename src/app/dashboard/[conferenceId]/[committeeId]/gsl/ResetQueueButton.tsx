"use client";

import { useState, useTransition } from "react";
import { resetGSLQueue } from "./actions";

export function ResetQueueButton({
  conferenceId,
  committeeId,
}: {
  conferenceId: string;
  committeeId: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-xs font-semibold text-danger hover:underline"
      >
        Reset Queue &amp; Start Over
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 bg-danger-soft px-4 py-2 rounded-lg">
      <span className="text-xs font-semibold text-danger">
        This clears the entire queue and all scores. Are you sure?
      </span>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => resetGSLQueue(conferenceId, committeeId))}
        className="text-xs font-bold text-white bg-danger px-3 py-1 rounded-md hover:bg-danger/90"
      >
        {isPending ? "Resetting..." : "Yes, reset"}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="text-xs font-semibold text-muted hover:text-ink"
      >
        Cancel
      </button>
    </div>
  );
}