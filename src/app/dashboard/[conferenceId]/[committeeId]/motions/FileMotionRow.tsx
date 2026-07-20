"use client";

import { useState, useTransition } from "react";
import { fileMotion } from "./actions";
import { MotionTypeSelect } from "./MotionTypeSelect";

export function FileMotionRow({
  conferenceId,
  committeeId,
  dayIndex,
}: {
  conferenceId: string;
  committeeId: string;
  dayIndex: number;
}) {
  const [raisedBy, setRaisedBy] = useState("");
  const [motionType, setMotionType] = useState("");
  const [topic, setTopic] = useState("");
  const [totalTime, setTotalTime] = useState("");
  const [perSpeaker, setPerSpeaker] = useState("");
  const [isPending, startTransition] = useTransition();

  const totalSeconds = totalTime ? Number(totalTime) * 60 : 0;
  const perSpeakerNum = perSpeaker ? Number(perSpeaker) : 0;
  const showSpeakerInfo = totalTime !== "" && perSpeaker !== "" && perSpeakerNum > 0;
  const speakerCount = showSpeakerInfo ? Math.floor(totalSeconds / perSpeakerNum) : 0;
  const remainder = showSpeakerInfo ? totalSeconds % perSpeakerNum : 0;

  const handleFile = () => {
    if (!raisedBy.trim() || !motionType.trim()) return;
    startTransition(() => {
      fileMotion(
        conferenceId,
        committeeId,
        dayIndex,
        raisedBy,
        motionType,
        topic,
        totalTime ? Number(totalTime) : null,
        perSpeaker ? Number(perSpeaker) : null
      );
      setRaisedBy("");
      setMotionType("");
      setTopic("");
      setTotalTime("");
      setPerSpeaker("");
    });
  };

  const fieldClass =
    "w-full px-4 py-3 text-base border border-line2 rounded-lg text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary";

  return (
    <div className="relative z-30 bg-panel border border-line rounded-shell shadow-sm p-6 mb-6 fade-up">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
            Raised By
          </label>
          <input
            type="text"
            value={raisedBy}
            onChange={(e) => setRaisedBy(e.target.value)}
            placeholder="e.g. the delegate of France"
            className={fieldClass}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
            Motion Type
          </label>
          <MotionTypeSelect value={motionType} onChange={setMotionType} />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
          Topic (optional)
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Nuclear non-proliferation in South Asia"
          className={fieldClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
            Total Time (minutes, optional)
          </label>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={totalTime}
            onChange={(e) => {
              if (/^-?\d*\.?\d*$/.test(e.target.value)) setTotalTime(e.target.value);
            }}
            placeholder="e.g. 10"
            className={`${fieldClass} font-mono`}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
            Per Speaker (seconds, optional)
          </label>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={perSpeaker}
            onChange={(e) => {
              if (/^-?\d*\.?\d*$/.test(e.target.value)) setPerSpeaker(e.target.value);
            }}
            placeholder="e.g. 60"
            className={`${fieldClass} font-mono`}
          />
        </div>

        <div className="pb-3">
          {showSpeakerInfo ? (
            <div>
              <span className="font-serif font-bold text-primary-deep text-xl">
                {speakerCount}
              </span>{" "}
              <span className="text-muted text-sm">speakers</span>
              {remainder !== 0 && (
                <div className="text-xs text-gold-deep font-medium mt-0.5">
                  Not evenly divisible ({remainder}s left over)
                </div>
              )}
            </div>
          ) : (
            <span className="text-muted text-sm">
              Enter both times to see speaker count
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleFile}
        disabled={!raisedBy.trim() || !motionType.trim() || isPending}
        className="bg-primary hover:bg-primary-deep text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
      >
        {isPending ? "Filing..." : "File motion"}
      </button>
    </div>
  );
}