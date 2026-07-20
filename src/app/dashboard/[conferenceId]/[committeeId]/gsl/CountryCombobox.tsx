"use client";

import { useState, useRef, useEffect } from "react";

type Status = "new" | "queued" | "recognized";
type Option = { id: string; name: string; status: Status };

const STATUS_STYLE: Record<Status, string> = {
  new: "text-ink",
  queued: "text-primary-deep bg-primary-soft/50",
  recognized: "text-gold-deep bg-gold-soft/70",
};

export function CountryCombobox({
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

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(query.toLowerCase())
  );

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
        className="w-full px-3 py-2.5 border border-line2 rounded-lg text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-40 mt-1 w-full max-h-64 overflow-y-auto bg-white border border-line rounded-lg shadow-xl">
          {filtered.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                onSelect(o.id);
                setQuery("");
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:brightness-95 flex items-center justify-between ${STATUS_STYLE[o.status]}`}
            >
              <span>{o.name}</span>
              {o.status === "recognized" && (
                <span className="text-[10px] font-semibold uppercase tracking-wide">
                  → GSL-II
                </span>
              )}
              {o.status === "queued" && (
                <span className="text-[10px] font-semibold uppercase tracking-wide">
                  in queue
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}