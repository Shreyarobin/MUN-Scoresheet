"use client";

import { useState, useTransition } from "react";
import { updateGSLScore, updateGSLVerbatim } from "./actions";

type Entry = {
  id: string;
  country: { name: string };
  gsl1Score: number | null;
  gsl1Verbatim: string | null;
  gsl2Score: number | null;
  gsl2Verbatim: string | null;
};

type LocalOverride = {
  gsl1Score?: number | null;
  gsl1Verbatim?: string;
  gsl2Score?: number | null;
  gsl2Verbatim?: string;
};

export function GSLBoard({
  conferenceId,
  committeeId,
  queue,
}: {
  conferenceId: string;
  committeeId: string;
  queue: Entry[];
}) {
  const [, startTransition] = useTransition();
  const [overrides, setOverrides] = useState<Record<string, LocalOverride>>({});

  const saveScore = (entryId: string, round: 1 | 2, raw: string) => {
    const value = raw === "" ? null : Number(raw);
    setOverrides((prev) => ({
      ...prev,
      [entryId]: { ...prev[entryId], [round === 1 ? "gsl1Score" : "gsl2Score"]: value },
    }));
    startTransition(() => {
      updateGSLScore(conferenceId, committeeId, entryId, round, value);
    });
  };

  const saveVerbatim = (entryId: string, round: 1 | 2, text: string) => {
    setOverrides((prev) => ({
      ...prev,
      [entryId]: { ...prev[entryId], [round === 1 ? "gsl1Verbatim" : "gsl2Verbatim"]: text },
    }));
    startTransition(() => {
      updateGSLVerbatim(conferenceId, committeeId, entryId, round, text);
    });
  };

  if (queue.length === 0) return null;

  return (
    <div className="space-y-4">
      {queue.map((entry, i) => {
        const e = { ...entry, ...overrides[entry.id] };
        const raw = (e.gsl1Score ?? 0) + (e.gsl2Score ?? 0);
        const recognition = (e.gsl1Score != null ? 1 : 0) + (e.gsl2Score != null ? 1 : 0);

        return (
          <div key={entry.id} className="bg-panel border border-line rounded-shell shadow-sm p-5 fade-up">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-muted font-mono text-sm">{i + 1}.</span>
                <span className="font-serif font-semibold text-lg text-ink">
                  {entry.country.name}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted">
                  Recognition <span className="font-semibold text-ink">{recognition}</span>
                </span>
                <span className="text-muted">
                  GSL Raw{" "}
                  <span className="font-serif font-bold text-primary-deep text-lg">{raw}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
                  GSL-I
                  <input
                    type="number"
                    min={0}
                    max={10}
                    defaultValue={e.gsl1Score ?? ""}
                    onBlur={(ev) => saveScore(entry.id, 1, ev.target.value)}
                    className="w-16 text-center px-2 py-1 border border-line2 rounded-md font-mono normal-case font-semibold focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary"
                  />
                  <span className="normal-case font-normal">/ 10</span>
                </label>
                <textarea
                  defaultValue={e.gsl1Verbatim ?? ""}
                  onBlur={(ev) => saveVerbatim(entry.id, 1, ev.target.value)}
                  rows={4}
                  placeholder="Speech notes / verbatim..."
                  className="w-full px-3 py-2 border border-line2 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
                  GSL-II
                  <input
                    type="number"
                    min={0}
                    max={10}
                    defaultValue={e.gsl2Score ?? ""}
                    onBlur={(ev) => saveScore(entry.id, 2, ev.target.value)}
                    className="w-16 text-center px-2 py-1 border border-line2 rounded-md font-mono normal-case font-semibold focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary"
                  />
                  <span className="normal-case font-normal">/ 10</span>
                </label>
                <textarea
                  defaultValue={e.gsl2Verbatim ?? ""}
                  onBlur={(ev) => saveVerbatim(entry.id, 2, ev.target.value)}
                  rows={4}
                  placeholder="Speech notes / verbatim... (if recognized again)"
                  className="w-full px-3 py-2 border border-line2 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}