"use client";

import { useState, useTransition } from "react";
import { addCountryToMod, removeFromMod, updateModScore, updateModVerbatim } from "./actions";
import { ModCountryCombobox } from "./ModCountryCombobox";

type Country = { id: string; name: string };
type Entry = {
  id: string;
  countryId: string;
  country: { name: string };
  score: number | null;
  verbatim: string | null;
};
type ModSession = { id: string; modNumber: number; topic: string; entries: Entry[] };

type LocalOverride = { score?: number | null; verbatim?: string };

export function ModBoard({
  conferenceId,
  committeeId,
  modSession,
  countries,
  recognitionMap,
  recognizedModsMap,
  modTotalMap,
}: {
  conferenceId: string;
  committeeId: string;
  modSession: ModSession;
  countries: Country[];
  recognitionMap: Record<string, number>;
  recognizedModsMap: Record<string, number[]>;
  modTotalMap: Record<string, number>;
}) {
  const [, startTransition] = useTransition();
  const [overrides, setOverrides] = useState<Record<string, LocalOverride>>({});

  const queuedIds = new Set(modSession.entries.map((e) => e.countryId));
  const options = countries.map((c) => ({
    id: c.id,
    name: c.name,
    mods: (recognizedModsMap[c.id] ?? []).filter((m) => m !== modSession.modNumber),
    inCurrentMod: queuedIds.has(c.id),
  }));

  const handleAdd = (countryId: string) => {
    startTransition(() => {
      addCountryToMod(conferenceId, committeeId, modSession.id, countryId);
    });
  };

  const saveScore = (entryId: string, raw: string) => {
    const value = raw === "" ? null : Number(raw);
    setOverrides((prev) => ({ ...prev, [entryId]: { ...prev[entryId], score: value } }));
    startTransition(() => {
      updateModScore(conferenceId, committeeId, entryId, value);
    });
  };

  const saveVerbatim = (entryId: string, text: string) => {
    setOverrides((prev) => ({ ...prev, [entryId]: { ...prev[entryId], verbatim: text } }));
    startTransition(() => {
      updateModVerbatim(conferenceId, committeeId, entryId, text);
    });
  };

  const handleScoreChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (!/^-?\d*\.?\d*$/.test(ev.target.value)) {
      ev.target.value = ev.target.value.slice(0, -1);
    }
  };

  return (
    <div>
      <div className="bg-panel border border-line rounded-shell shadow-sm p-5 mb-6">
        <span className="font-serif text-lg font-bold text-primary-deep">
          Mod {modSession.modNumber}
        </span>
        <p className="text-ink font-medium mt-1">{modSession.topic}</p>
      </div>

      <div className="relative z-30 bg-panel border border-line rounded-shell shadow-sm p-5 mb-6 max-w-2xl">
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-2">
          Add another speaker
        </label>
        <ModCountryCombobox options={options} onSelect={handleAdd} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <div className="bg-panel border border-line rounded-shell shadow-sm p-4 h-fit">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Lists</div>
          <ul className="space-y-2">
            {modSession.entries.map((entry, i) => {
              const e = { ...entry, ...overrides[entry.id] };
              const spoken = e.score != null;
              return (
                <li key={entry.id} className="flex items-center gap-2 text-sm">
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      spoken ? "bg-success border-success text-white" : "border-line2 bg-white"
                    }`}
                  >
                    {spoken && "✓"}
                  </span>
                  <span className="text-muted font-mono text-xs">{i + 1}.</span>
                  <span className="text-ink font-medium truncate">{entry.country.name}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-4">
          {modSession.entries.map((entry, i) => {
            const e = { ...entry, ...overrides[entry.id] };
            const totalRecognition = recognitionMap[entry.countryId] ?? 0;
            const total = modTotalMap[entry.countryId] ?? 0;

            return (
              <div key={entry.id} className="bg-panel border border-line rounded-shell shadow-sm p-5 fade-up">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-muted font-mono text-sm">{i + 1}.</span>
                    <span className="font-serif font-semibold text-lg text-ink">
                      {entry.country.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted">
                      Recognition <span className="font-semibold text-ink">{totalRecognition}</span>
                    </span>
                    <span className="text-muted">
                      Mod (Total){" "}
                      <span className="font-serif font-bold text-primary-deep text-lg">{total}</span>
                    </span>
                    <button
                      onClick={() =>
                        startTransition(() => removeFromMod(conferenceId, committeeId, entry.id))
                      }
                      className="text-danger hover:underline text-xs font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
                  Mod {modSession.modNumber}
                  <input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    defaultValue={e.score ?? ""}
                    onChange={handleScoreChange}
                    onBlur={(ev) => saveScore(entry.id, ev.target.value)}
                    className="w-16 text-center px-2 py-1 border border-line2 rounded-md font-mono normal-case font-semibold focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary"
                  />
                  <span className="normal-case font-normal">/ 10</span>
                </label>
                <textarea
                  defaultValue={e.verbatim ?? ""}
                  onBlur={(ev) => saveVerbatim(entry.id, ev.target.value)}
                  rows={4}
                  placeholder="Speech notes / verbatim..."
                  className="w-full px-3 py-2 border border-line2 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}