"use client";

import { useTransition } from "react";
import { updateMotionStatus, deleteMotion } from "./actions";

type Motion = {
  id: string;
  raisedBy: string;
  motionType: string;
  topic: string | null;
  totalTimeMinutes: number | null;
  perSpeakerSeconds: number | null;
  status: "PENDING" | "PASS" | "FAIL" | "NOT_VOTED";
};

export function MotionCard({
  conferenceId,
  committeeId,
  motion,
}: {
  conferenceId: string;
  committeeId: string;
  motion: Motion;
}) {
  const [isPending, startTransition] = useTransition();

  const hasTiming =
    motion.totalTimeMinutes != null &&
    motion.perSpeakerSeconds != null &&
    motion.perSpeakerSeconds > 0;
  const totalSeconds = hasTiming ? motion.totalTimeMinutes! * 60 : 0;
  const speakerCount = hasTiming ? Math.floor(totalSeconds / motion.perSpeakerSeconds!) : 0;
  const remainder = hasTiming ? totalSeconds % motion.perSpeakerSeconds! : 0;

  const setStatus = (status: "PASS" | "FAIL" | "NOT_VOTED") => {
    startTransition(() => {
      updateMotionStatus(conferenceId, committeeId, motion.id, status);
    });
  };

  return (
    <div
      className={`bg-panel border rounded-shell shadow-sm px-5 py-4 flex items-center justify-between gap-4 flex-wrap ${
        motion.status === "PENDING" ? "border-accent/50 bg-accent-soft/30" : "border-line"
      }`}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-serif font-semibold text-lg text-ink">{motion.raisedBy}</span>
        <span className="text-xs font-semibold uppercase tracking-wide bg-primary-soft text-primary-deep px-2.5 py-1 rounded-full">
          {motion.motionType}
        </span>
        {motion.status === "PENDING" && (
          <span className="text-xs font-semibold uppercase tracking-wide bg-accent-soft text-accent px-2.5 py-1 rounded-full">
            Awaiting Vote
          </span>
        )}
        {motion.topic && (
          <span className="text-sm text-muted italic">&quot;{motion.topic}&quot;</span>
        )}
        {hasTiming && (
          <span className="text-sm text-muted">
            {motion.totalTimeMinutes} min · {motion.perSpeakerSeconds}s/speaker ·{" "}
            <span className="font-semibold text-ink">{speakerCount} speakers</span>
            {remainder !== 0 && (
              <span className="text-gold-deep"> (+{remainder}s left over)</span>
            )}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setStatus("PASS")}
          disabled={isPending}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
            motion.status === "PASS"
              ? "bg-success text-white"
              : "bg-success-soft text-success hover:bg-success/20"
          }`}
        >
          Pass
        </button>
        <button
          onClick={() => setStatus("FAIL")}
          disabled={isPending}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
            motion.status === "FAIL"
              ? "bg-danger text-white"
              : "bg-danger-soft text-danger hover:bg-danger/20"
          }`}
        >
          Fail
        </button>
        <button
          onClick={() => setStatus("NOT_VOTED")}
          disabled={isPending}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
            motion.status === "NOT_VOTED"
              ? "bg-ink text-white"
              : "bg-wash2 text-muted hover:bg-wash"
          }`}
        >
          Not Voted
        </button>
        <button
          onClick={() =>
            startTransition(() => deleteMotion(conferenceId, committeeId, motion.id))
          }
          className="text-muted hover:text-danger w-6 h-6 rounded-full grid place-items-center"
        >
          ✕
        </button>
      </div>
    </div>
  );
}