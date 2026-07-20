"use client";

import { useState, useTransition } from "react";
import { resetRollCall } from "./actions";

export function ResetRollCallButton({
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
        Reset Roll Call
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 bg-danger-soft px-4 py-2 rounded-lg">
      <span className="text-xs font-semibold text-danger">
        This deletes all days and attendance data. Are you sure?
      </span>
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(() => resetRollCall(conferenceId, committeeId))
        }
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