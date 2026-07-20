"use client";

import { useState, useRef, useEffect } from "react";

type Country = { id: string; name: string };

export function PooCountrySelect({
  countries,
  value,
  onChange,
}: {
  countries: Country[];
  value: string;
  onChange: (id: string) => void;
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

  const selectedName = countries.find((c) => c.id === value)?.name ?? "";
  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={open ? query : selectedName}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setQuery("");
          setOpen(true);
        }}
        placeholder="Search and select a country..."
        className="w-full px-4 py-3 text-base border border-line2 rounded-lg text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-40 mt-1 w-full max-h-64 overflow-y-auto bg-white border border-line rounded-lg shadow-xl">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onChange(c.id);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-wash"
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}