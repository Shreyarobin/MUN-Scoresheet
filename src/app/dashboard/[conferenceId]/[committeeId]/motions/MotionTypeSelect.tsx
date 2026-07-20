"use client";

import { useState } from "react";

const PRESET_TYPES = [
  "Moderated Caucus",
  "Unmoderated Caucus",
  "Extend Debate",
  "Table the Topic",
  "Introduce Draft Resolution",
  "Round Robin",
  "Suspend the Meeting",
  "Adjourn the Meeting",
];

export function MotionTypeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [isOther, setIsOther] = useState(
    value !== "" && !PRESET_TYPES.includes(value)
  );

  return (
    <div className="flex flex-col gap-2">
      <select
        value={isOther ? "__other__" : value}
        onChange={(e) => {
          if (e.target.value === "__other__") {
            setIsOther(true);
            onChange("");
          } else {
            setIsOther(false);
            onChange(e.target.value);
          }
        }}
        className="px-3 py-2.5 border border-line2 rounded-lg text-ink bg-white focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary"
      >
        <option value="">Motion type...</option>
        {PRESET_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
        <option value="__other__">Other...</option>
      </select>
      {isOther && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Specify motion type"
          className="px-3 py-2.5 border border-line2 rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary"
        />
      )}
    </div>
  );
}