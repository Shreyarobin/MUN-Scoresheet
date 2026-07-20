"use client";

type Country = { id: string; name: string };
type PooEntry = {
  id: string;
  countryId: string;
  poNumber: number;
  score: number;
};

export function PooTable({
  countries,
  entries,
}: {
  countries: Country[];
  entries: PooEntry[];
}) {
  if (entries.length === 0) {
    return <p className="text-muted">No Points of Order raised yet.</p>;
  }

  // For each country, get their own entries in chronological order (by global poNumber),
  // then re-index them locally as 1, 2, 3... for that country specifically.
  const perCountry = new Map<string, number[]>(); // countryId -> [score1, score2, ...] in their own order

  for (const country of countries) {
    const ownEntries = entries
      .filter((e) => e.countryId === country.id)
      .sort((a, b) => a.poNumber - b.poNumber);
    perCountry.set(country.id, ownEntries.map((e) => e.score));
  }

  const maxCount = Math.max(0, ...Array.from(perCountry.values()).map((arr) => arr.length));
  const columnIndexes = Array.from({ length: maxCount }, (_, i) => i + 1);

  const rawTotals = new Map<string, number>();
  for (const country of countries) {
    const scores = perCountry.get(country.id) ?? [];
    rawTotals.set(country.id, scores.reduce((sum, s) => sum + s, 0));
  }

  const maxRaw = Math.max(0, ...Array.from(rawTotals.values()));
  const needsScaling = maxCount > 3;

  return (
    <div>
      {needsScaling && (
        <div className="bg-gold-soft text-gold-deep text-sm font-medium px-4 py-3 rounded-lg mb-4">
          The highest number of Points of Order raised by a single delegate is{" "}
          <strong>{maxCount}</strong>, exceeding 3 — every delegate&apos;s total is scaled
          as <strong>5 × Raw Total ÷ {maxRaw}</strong> (the highest Raw Total), so the top
          scorer&apos;s total equals 5.
        </div>
      )}

      <div className="bg-panel border border-line rounded-shell shadow-sm overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-wash2 border-b border-line">
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted px-4 py-3 sticky left-0 bg-wash2 whitespace-nowrap">
                Country
              </th>
              {columnIndexes.map((n) => (
                <th
                  key={n}
                  className="text-center text-xs font-semibold uppercase tracking-wide text-muted px-3 py-3 whitespace-nowrap"
                >
                  PoO {n}
                </th>
              ))}
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-3 whitespace-nowrap">
                Count
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-3 whitespace-nowrap">
                Raw Total
              </th>
              {needsScaling && (
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-3 whitespace-nowrap">
                  5 × Raw ÷ {maxRaw}
                </th>
              )}
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-3 whitespace-nowrap">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {countries.map((country) => {
              const scores = perCountry.get(country.id) ?? [];
              const raw = rawTotals.get(country.id) ?? 0;
              const count = scores.length;
              const scaled = needsScaling && maxRaw > 0 ? (5 * raw) / maxRaw : raw;

              return (
                <tr key={country.id} className="border-b border-line">
                  <td className="px-4 py-2.5 font-semibold text-ink text-sm sticky left-0 bg-panel whitespace-nowrap">
                    {country.name}
                  </td>
                  {columnIndexes.map((n) => {
                    const score = scores[n - 1];
                    return (
                      <td
                        key={n}
                        className="px-3 py-2.5 text-center font-mono text-sm text-ink"
                      >
                        {score !== undefined ? score : <span className="text-muted/50">—</span>}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2.5 font-medium text-ink">{count}</td>
                  <td className="px-3 py-2.5 font-mono text-ink">{raw}</td>
                  {needsScaling && (
                    <td className="px-3 py-2.5 font-mono text-muted text-xs">
                      5 × {raw} ÷ {maxRaw}
                    </td>
                  )}
                  <td className="px-3 py-2.5 font-serif font-bold text-primary-deep text-lg">
                    {needsScaling ? scaled.toFixed(2) : raw}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}