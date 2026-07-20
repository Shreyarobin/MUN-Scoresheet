"use client";

import { useState, useTransition } from "react";
import { raisePoo } from "./actions";
import { PooCountrySelect } from "./PooCountrySelect";

type Country = { id: string; name: string };

export function RaisePooForm({
  conferenceId,
  committeeId,
  countries,
  nextNumber,
}: {
  conferenceId: string;
  committeeId: string;
  countries: Country[];
  nextNumber: number;
}) {
  const [open, setOpen] = useState(false);
  const [countryId, setCountryId] = useState("");
  const [score, setScore] = useState("3");
  const [raisedDuring, setRaisedDuring] = useState("");
  const [comments, setComments] = useState("");
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setCountryId("");
    setScore("3");
    setRaisedDuring("");
    setComments("");
    setOpen(false);
  };

  const handleSubmit = () => {
    if (!countryId || !raisedDuring.trim()) return;
    startTransition(() => {
      raisePoo(conferenceId, committeeId, countryId, Number(score), raisedDuring, comments);
      reset();
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-primary hover:bg-primary-deep text-white font-semibold px-6 py-3 rounded-lg transition-colors mb-6"
      >
        + Raise Point of Order (PoO {nextNumber})
      </button>
    );
  }

  return (
    <div className="relative z-30 max-w-2xl bg-panel border border-line rounded-shell shadow-sm p-8 mb-6 fade-up">
      <div className="flex items-center gap-3 mb-5">
        <span className="font-serif text-xl font-bold text-primary-deep">PoO {nextNumber}</span>
        <h2 className="text-xl font-serif font-semibold text-ink">New Point of Order</h2>
      </div>

      <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-2">
        Delegate Raising the Point of Order
      </label>
      <div className="mb-5">
        <PooCountrySelect countries={countries} value={countryId} onChange={setCountryId} />
      </div>

      <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-2">
        Score (out of 3)
      </label>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={score}
        onChange={(e) => {
          const v = e.target.value;
          if (/^-?\d*\.?\d*$/.test(v)) setScore(v);
        }}
        className="w-24 px-3 py-2.5 border border-line2 rounded-lg text-ink font-mono mb-5 focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary"
      />

      <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-2">
        Raised During the Speech Of
      </label>
      <input
        type="text"
        value={raisedDuring}
        onChange={(e) => setRaisedDuring(e.target.value)}
        placeholder="e.g. the delegate of France"
        className="w-full px-4 py-3 text-base border border-line2 rounded-lg text-ink mb-5 focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary"
      />

      <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-2">
        Comments
      </label>
      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        rows={3}
        placeholder="Additional remarks..."
        className="w-full px-4 py-3 border border-line2 rounded-lg text-ink resize-y mb-6 focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary"
      />

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={!countryId || !raisedDuring.trim() || isPending}
          className="bg-primary hover:bg-primary-deep text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {isPending ? "Recording..." : `Record PoO ${nextNumber}`}
        </button>
        <button
          onClick={reset}
          className="text-muted hover:text-ink font-semibold px-4 py-3"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}