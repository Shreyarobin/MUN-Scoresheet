"use client";

import { useState, useRef, useEffect } from "react";
import { ModSetupForm } from "./ModSetupForm";
import { ModBoard } from "./ModBoard";
import { ModTotalTable } from "./ModTotalTable";

type Country = { id: string; name: string };
type Entry = {
  id: string;
  countryId: string;
  country: { name: string };
  score: number | null;
  verbatim: string | null;
};
type ModSession = { id: string; modNumber: number; topic: string; entries: Entry[] };

export function ModsPageClient({
  conferenceId,
  committeeId,
  countries,
  modSessions,
  recognitionMap,
  recognizedModsMap,
  modTotalMap,
}: {
  conferenceId: string;
  committeeId: string;
  countries: Country[];
  modSessions: ModSession[];
  recognitionMap: Record<string, number>;
  recognizedModsMap: Record<string, number[]>;
  modTotalMap: Record<string, number>;
}) {
  const [active, setActive] = useState<string>(
    modSessions.length > 0 ? modSessions[modSessions.length - 1].id : "new"
  );
  const prevCountRef = useRef(modSessions.length);

  useEffect(() => {
    if (modSessions.length > prevCountRef.current) {
      setActive(modSessions[modSessions.length - 1].id);
    }
    prevCountRef.current = modSessions.length;
  }, [modSessions.length, modSessions]);

  const activeSession = modSessions.find((m) => m.id === active);
  const nextModNumber = (modSessions[modSessions.length - 1]?.modNumber ?? 0) + 1;

  return (
    <div>
      <div className="inline-flex flex-wrap gap-1 bg-wash2 border border-line rounded-full p-1 mb-6">
        {modSessions.map((m) => (
          <button
            key={m.id}
            onClick={() => setActive(m.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              active === m.id ? "bg-ink text-white" : "text-muted hover:text-ink"
            }`}
          >
            Mod {m.modNumber}
          </button>
        ))}
        {modSessions.length > 0 && (
          <button
            onClick={() => setActive("total")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              active === "total" ? "bg-gold text-white" : "text-gold-deep hover:bg-gold-soft"
            }`}
          >
            Total
          </button>
        )}
        <button
          onClick={() => setActive("new")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            active === "new" ? "bg-primary text-white" : "text-primary-deep hover:bg-primary-soft"
          }`}
        >
          + New Mod
        </button>
      </div>

      {active === "total" ? (
        <ModTotalTable countries={countries} modSessions={modSessions} />
      ) : active === "new" || !activeSession ? (
        <ModSetupForm
          conferenceId={conferenceId}
          committeeId={committeeId}
          countries={countries}
          nextModNumber={nextModNumber}
          recognizedModsMap={recognizedModsMap}
        />
      ) : (
        <ModBoard
          key={activeSession.id}
          conferenceId={conferenceId}
          committeeId={committeeId}
          modSession={activeSession}
          countries={countries}
          recognitionMap={recognitionMap}
          recognizedModsMap={recognizedModsMap}
          modTotalMap={modTotalMap}
        />
      )}
    </div>
  );
}