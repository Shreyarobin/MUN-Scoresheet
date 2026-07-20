"use client";

import { useState, useRef, useEffect } from "react";

type Option = {
  id: string;
  name: string;
  mods: number[];        // mod numbers this country is a list member of, EXCLUDING the current mod
  inCurrentMod: boolean;  // already a member of the mod currently being viewed/built
};

export function ModCountryCombobox({
  options,
  onSelect,
  placeholder = "Search and select a country...",
}: {
  options: Option[];
  onSelect: (id: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()));

  const infoFor = (o: Option) => {
    const total = o.mods.length + (o.inCurrentMod ? 1 : 0);
    if (o.inCurrentMod) {
      return { label: `${total} : Already in this Mod`, style: "text-success bg-success-soft/60" };
    }
    if (o.mods.length > 0) {
      return {
        label: `${o.mods.length} : MOD ${o.mods.join(", ")}`,
        style: "text-gold-deep bg-gold-soft/70",
      };
    }
    return { label: "Not yet recognized", style: "text-ink" };
  };

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full px-4 py-3 text-base border border-line2 rounded-lg text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-40 mt-1 w-full max-h-80 overflow-y-auto bg-white border border-line rounded-lg shadow-xl">
          {filtered.map((o) => {
            const info = infoFor(o);
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  onSelect(o.id);
                  setQuery("");
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3 hover:brightness-95 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 ${info.style}`}
              >
                <span className="font-medium text-sm">{o.name}</span>
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {info.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}