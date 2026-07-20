"use client";

import { useActionState } from "react";
import { addCountries } from "./actions";

export function AddCountriesForm({
  conferenceId,
  committeeId,
}: {
  conferenceId: string;
  committeeId: string;
}) {
  const [state, formAction, isPending] = useActionState(addCountries, null);

  return (
    <form
      action={formAction}
      className="bg-panel border border-line rounded-shell shadow-sm p-6 mb-6 fade-up"
    >
      <input type="hidden" name="committeeId" value={committeeId} />
      <input type="hidden" name="conferenceId" value={conferenceId} />
      <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-2">
        Add countries (one per line, or comma-separated)
      </label>
      <textarea
        name="countries"
        rows={12}
        placeholder={"United States\nRussian Federation\nChina\nUnited Kingdom\nFrance\nIndia\n..."}
        className="w-full min-h-[280px] px-4 py-3 text-base border border-line2 rounded-lg text-ink resize-y focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary"
      />
      <button
        type="submit"
        disabled={isPending}
        className="mt-4 bg-primary hover:bg-primary-deep active:scale-[0.98] text-white font-semibold px-6 py-3 rounded-lg transition-all disabled:opacity-50"
      >
        {isPending ? "Adding..." : "Add Countries"}
      </button>

      {state && (
        <div className="mt-4 space-y-2">
          {state.added.length > 0 && (
            <p className="text-success bg-success-soft rounded-lg px-3 py-2 text-sm font-medium">
              Added {state.added.length}: {state.added.join(", ")}
            </p>
          )}
          {state.duplicates.length > 0 && (
            <p className="text-accent bg-accent-soft rounded-lg px-3 py-2 text-sm font-medium">
              Skipped {state.duplicates.length} duplicate
              {state.duplicates.length > 1 ? "s" : ""}: {state.duplicates.join(", ")}
            </p>
          )}
        </div>
      )}
    </form>
  );
}