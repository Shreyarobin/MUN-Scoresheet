"use client";

import { useState } from "react";
import { FileMotionRow } from "./FileMotionRow";
import { MotionCard } from "./MotionCard";

type Motion = {
  id: string;
  dayIndex: number;
  raisedBy: string;
  motionType: string;
  topic: string | null;
  totalTimeMinutes: number | null;
  perSpeakerSeconds: number | null;
  status: "PENDING" | "PASS" | "FAIL" | "NOT_VOTED";
  createdAt: Date;
};

export function MotionsPageClient({
  conferenceId,
  committeeId,
  motions,
}: {
  conferenceId: string;
  committeeId: string;
  motions: Motion[];
}) {
  const existingDays = Array.from(new Set(motions.map((m) => m.dayIndex))).sort(
    (a, b) => a - b
  );
  const [daysAvailable, setDaysAvailable] = useState<number[]>(
    existingDays.length > 0 ? existingDays : []
  );
  const [activeDay, setActiveDay] = useState<number | null>(
    existingDays.length > 0 ? existingDays[existingDays.length - 1] : null
  );

  if (activeDay === null) {
    return (
      <div className="max-w-md bg-panel border border-line rounded-shell shadow-sm p-8 fade-up">
        <h2 className="text-xl font-serif font-semibold text-ink mb-1">
          Which day are you logging motions for?
        </h2>
        <p className="text-sm text-muted mb-5">
          You can add more days later as the committee progresses.
        </p>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => {
                setDaysAvailable([n]);
                setActiveDay(n);
              }}
              className="w-14 h-14 rounded-lg font-semibold border border-line2 bg-white text-ink hover:border-primary hover:text-primary-deep transition-colors"
            >
              Day {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const dayMotions = motions
    .filter((m) => m.dayIndex === activeDay)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const handleAddDay = () => {
    const next = Math.max(...daysAvailable, 0) + 1;
    setDaysAvailable((prev) => [...prev, next]);
    setActiveDay(next);
  };

  return (
    <div>
      <div className="inline-flex flex-wrap gap-1 bg-wash2 border border-line rounded-full p-1 mb-6">
        {daysAvailable.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeDay === d ? "bg-ink text-white" : "text-muted hover:text-ink"
            }`}
          >
            Day {d}
          </button>
        ))}
        <button
          onClick={handleAddDay}
          className="px-4 py-1.5 rounded-full text-xs font-semibold text-primary-deep hover:bg-primary-soft transition-colors"
        >
          + New Day
        </button>
      </div>

      <FileMotionRow
        conferenceId={conferenceId}
        committeeId={committeeId}
        dayIndex={activeDay}
      />

      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-3">
        Day {activeDay}
      </h2>

      {dayMotions.length === 0 ? (
        <p className="text-muted">No motions filed for this day yet.</p>
      ) : (
        <div className="space-y-3">
          {dayMotions.map((motion) => (
            <MotionCard
              key={motion.id}
              conferenceId={conferenceId}
              committeeId={committeeId}
              motion={motion}
            />
          ))}
        </div>
      )}
    </div>
  );
}