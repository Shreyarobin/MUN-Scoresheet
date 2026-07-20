"use client";

import { useState, useTransition } from "react";
import { createModSession } from "./actions";
import { ModCountryCombobox } from "./ModCountryCombobox";

type Country = { id: string; name: string };

export function ModSetupForm({
  conferenceId,
  committeeId,
  countries,
  nextModNumber,
  recognizedModsMap,
}: {
  conferenceId: string;
  committeeId: string;
  countries: Country[];
  nextModNumber: number;
  recognizedModsMap: Record<string, number[]>;
}) {
  const [topic, setTopic] = useState("");
  const [selected, setSelected] = useState<Country[]>([]);
  const [isPending, startTransition] = useTransition();

  const selectedIds = new Set(selected.map((c) => c.id));
  const options = countries.map((c) => ({
    id: c.id,
    name: c.name,
    mods: recognizedModsMap[c.id] ?? [],
    inCurrentMod: selectedIds.has(c.id),
  }));

  const handleAdd = (id: string) => {
    const country = countries.find((c) => c.id === id);
    if (country && !selectedIds.has(id)) setSelected((prev) => [...prev, country]);
  };

  const handleRemove = (id: string) => {
    setSelected((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCreate = () => {
    if (!topic.trim() || selected.length === 0) return;
    startTransition(() => {
      createModSession(conferenceId, committeeId, topic.trim(), selected.map((c) => c.id));
    });
  };

  return (
    <div className="relative z-30 max-w-2xl mx-auto bg-panel border border-line rounded-shell shadow-sm p-8 fade-up">
      <div className="flex items-center gap-3 mb-1">
        <span className="font-serif text-xl font-bold text-primary-deep">Mod {nextModNumber}</span>
        <h2 className="text-xl font-serif font-semibold text-ink">New Moderated Caucus</h2>
      </div>
      <p className="text-sm text-muted mb-5">
        Set the topic, then build the speaking list. You can add more speakers any time
        after creating.
      </p>

      <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-2">
        Topic
      </label>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="e.g. Measures to curb illicit arms trafficking"
        className="w-full px-4 py-3 text-base border border-line2 rounded-lg text-ink mb-5 focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary"
      />

      <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-2">
        Speaking List
      </label>
      <ModCountryCombobox options={options} onSelect={handleAdd} />

      {selected.length > 0 && (
        <ol className="flex flex-wrap gap-2 mt-4">
          {selected.map((c, i) => (
            <li
              key={c.id}
              className="flex items-center gap-2 bg-wash border border-line rounded-full pl-3 pr-1.5 py-1 text-sm"
            >
              <span className="font-semibold text-muted">{i + 1}.</span>
              <span className="font-medium text-ink">{c.name}</span>
              <button
                onClick={() => handleRemove(c.id)}
                className="text-muted hover:text-danger w-5 h-5 rounded-full grid place-items-center text-xs"
              >
                ✕
              </button>
            </li>
          ))}
        </ol>
      )}

      <button
        onClick={handleCreate}
        disabled={!topic.trim() || selected.length === 0 || isPending}
        className="mt-6 w-full bg-primary hover:bg-primary-deep text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
      >
        {isPending ? "Creating..." : `Create Mod ${nextModNumber}`}
      </button>
    </div>
  );
}