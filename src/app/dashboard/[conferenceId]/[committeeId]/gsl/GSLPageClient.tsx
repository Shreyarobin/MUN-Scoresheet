"use client";

import { useState } from "react";
import { QueueForm } from "./QueueForm";
import { GSLBoard } from "./GSLBoard";
import { ResetQueueButton } from "./ResetQueueButton";

type Country = { id: string; name: string };
type Entry = {
  id: string;
  countryId: string;
  country: { name: string };
  gsl1Score: number | null;
  gsl1Verbatim: string | null;
  gsl2Score: number | null;
  gsl2Verbatim: string | null;
};

export function GSLPageClient({
  conferenceId,
  committeeId,
  countries,
  queue,
}: {
  conferenceId: string;
  committeeId: string;
  countries: Country[];
  queue: Entry[];
}) {
  // Only initialized ONCE — stays "setup" even after the queue gains entries,
  // until the person explicitly clicks "Continue to Marksheet".
  const [phase, setPhase] = useState<"setup" | "board">(
    queue.length === 0 ? "setup" : "board"
  );

  if (phase === "setup") {
    return (
      <div>
        <QueueForm
          conferenceId={conferenceId}
          committeeId={committeeId}
          countries={countries}
          queue={queue}
          variant="setup"
        />
        {queue.length > 0 && (
          <div className="max-w-xl mx-auto mt-4 flex justify-end">
            <button
              onClick={() => setPhase("board")}
              className="bg-primary hover:bg-primary-deep text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Continue to Marksheet →
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => setPhase("setup")}
          className="text-xs font-semibold text-primary-deep hover:underline"
        >
          ← Back to Queue Setup
        </button>
        <ResetQueueButton conferenceId={conferenceId} committeeId={committeeId} />
      </div>
      <QueueForm
        conferenceId={conferenceId}
        committeeId={committeeId}
        countries={countries}
        queue={queue}
        variant="compact"
      />
      <GSLBoard conferenceId={conferenceId} committeeId={committeeId} queue={queue} />
    </>
  );
}