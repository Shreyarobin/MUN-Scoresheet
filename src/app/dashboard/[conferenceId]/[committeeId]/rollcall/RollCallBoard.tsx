"use client";

import { useState, useTransition } from "react";
import { cycleStatus, commitSession } from "./actions";
import { computeMajorities } from "@/lib/majorities";

type Status = "PRESENT" | "PRESENT_VOTING" | "ABSENT";

type Country = { id: string; name: string; everPresentVoting: boolean };
type Session = {
  id: string;
  label: string;
  dayIndex: number;
  committed: boolean;
  entries: { countryId: string; status: Status }[];
};

const STATUS_STYLE: Record<Status, string> = {
  PRESENT: "border-success/50 bg-success-soft",
  PRESENT_VOTING: "border-gold/50 bg-gold-soft",
  ABSENT: "border-danger/30 bg-danger-soft/40",
};

const STATUS_TEXT: Record<Status, string> = {
  PRESENT: "text-success",
  PRESENT_VOTING: "text-gold-deep",
  ABSENT: "text-danger",
};

const STATUS_LABEL: Record<Status, string> = {
  PRESENT: "Present",
  PRESENT_VOTING: "Present & Voting",
  ABSENT: "Absent",
};

const STATUS_DOT: Record<Status, string> = {
  PRESENT: "bg-success",
  PRESENT_VOTING: "bg-gold",
  ABSENT: "bg-danger",
};

export function RollCallBoard({
  conferenceId,
  committeeId,
  countries,
  sessions,
}: {
  conferenceId: string;
  committeeId: string;
  countries: Country[];
  sessions: Session[];
}) {
  const [activeDay, setActiveDay] = useState(
    sessions.find((s) => !s.committed)?.id ?? sessions[sessions.length - 1]?.id
  );
  const [isPending, startTransition] = useTransition();

  const activeSession = sessions.find((s) => s.id === activeDay);
  if (!activeSession) return <p className="text-muted">No roll call days set up.</p>;

  const statusFor = (session: Session, countryId: string): Status =>
    session.entries.find((e) => e.countryId === countryId)?.status ?? "ABSENT";

  const strength = countries.filter((c) => {
    const s = statusFor(activeSession, c.id);
    return s === "PRESENT" || s === "PRESENT_VOTING";
  }).length;
  const maj = computeMajorities(strength);

  const precedingSessions = sessions
    .filter((s) => s.dayIndex < activeSession.dayIndex)
    .sort((a, b) => b.dayIndex - a.dayIndex);

  const anyLocked = countries.some((c) => c.everPresentVoting);

  const handleClick = (countryId: string) => {
    if (activeSession.committed) return;
    startTransition(() => {
      cycleStatus(conferenceId, committeeId, activeSession.id, countryId);
    });
  };

  const handleCommit = () => {
    startTransition(() => {
      commitSession(conferenceId, committeeId, activeSession.id);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      <div>
        {/* Day tabs */}
        <div className="inline-flex bg-wash2 border border-line rounded-full p-1 mb-5">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveDay(s.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                s.id === activeDay ? "bg-ink text-white" : "text-muted hover:text-ink"
              }`}
            >
              {s.label}
              {s.committed && " "}
            </button>
          ))}
        </div>

        {/* Compact majority strip */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-panel border border-line rounded-shell shadow-sm px-5 py-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted mr-1">
            {activeSession.label}
          </span>
          {[
            ["Strength", maj.strength],
            ["Simple Maj.", maj.simple],
            ["Special (2/3)", maj.special],
            ["1/3rd", maj.third],
          ].map(([label, value]) => (
            <div key={label as string} className="flex items-baseline gap-1.5">
              <span className="font-serif text-lg font-bold text-primary-deep">{value}</span>
              <span className="text-xs text-muted font-medium">{label}</span>
            </div>
          ))}
        </div>

        {activeSession.committed && (
          <div className="bg-success-soft text-success text-sm font-semibold px-4 py-2 rounded-lg mb-4 inline-block">
            {activeSession.label} is committed and frozen.
          </div>
        )}

        {/* Country list â€” vertical, alphabetical */}
        <ul className="divide-y divide-line bg-panel border border-line rounded-shell shadow-sm overflow-hidden">
          {countries.map((country) => {
            const status = statusFor(activeSession, country.id);
            const disabled = activeSession.committed;

            return (
              <li key={country.id}>
                <button
                  disabled={disabled}
                  onClick={() => handleClick(country.id)}
                  className={`w-full flex items-center justify-between px-5 py-3 transition-colors ${STATUS_STYLE[status]} ${
                    disabled ? "cursor-not-allowed" : "cursor-pointer hover:brightness-95"
                  }`}
                >
                  <span className="font-semibold text-sm text-ink">{country.name}</span>
                  <span className={`flex items-center gap-2 text-xs font-semibold ${STATUS_TEXT[status]}`}>
                    <span className={`w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
                    {STATUS_LABEL[status]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {anyLocked && (
          <p className="text-xs text-muted mt-3">
            <span className="inline-block w-2 h-2 rounded-full bg-gold mr-1.5 align-middle" />
            Countries that have ever been marked Present &amp; Voting can no longer select plain
            Present, on this or any later day.
          </p>
        )}

        {!activeSession.committed && (
          <button
            onClick={handleCommit}
            disabled={isPending}
            className="mt-6 bg-ink hover:bg-black text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            Commit &amp; Freeze {activeSession.label}
          </button>
        )}
      </div>

      {/* Side history â€” vertical, preceding days only */}
      <aside className="space-y-4">
        {precedingSessions.map((s) => {
          const sStrength = countries.filter((c) => {
            const st = statusFor(s, c.id);
            return st === "PRESENT" || st === "PRESENT_VOTING";
          }).length;
          const sMaj = computeMajorities(sStrength);

          return (
            <div key={s.id} className="bg-panel border border-line rounded-shell shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-ink">{s.label}</span>
                <span className="text-xs text-success font-semibold">Committed</span>
              </div>
              <div className="text-xs text-muted mb-3 flex flex-wrap gap-x-3 gap-y-1">
                <span>Str {sMaj.strength}</span>
                <span>Simple {sMaj.simple}</span>
                <span>2/3 {sMaj.special}</span>
                <span>1/3 {sMaj.third}</span>
              </div>
              <div className="flex flex-col gap-1">
                {countries.map((c) => {
                  const st = statusFor(s, c.id);
                  if (st === "ABSENT") return null;
                  return (
                    <div key={c.id} className="flex items-center justify-between text-xs">
                      <span className="text-ink font-medium">{c.name}</span>
                      <span
                        className={
                          st === "PRESENT_VOTING" ? "text-gold-deep font-semibold" : "text-success font-semibold"
                        }
                      >
                        {st === "PRESENT_VOTING" ? "P&V" : "P"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </aside>
    </div>
  );
}
