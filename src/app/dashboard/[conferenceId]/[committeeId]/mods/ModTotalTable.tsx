"use client";

type Country = { id: string; name: string };
type Entry = { countryId: string; score: number | null };
type ModSession = { id: string; modNumber: number; entries: Entry[] };

export function ModTotalTable({
  countries,
  modSessions,
}: {
  countries: Country[];
  modSessions: ModSession[];
}) {
  const scoreMap = new Map<string, Map<number, number>>();
  for (const mod of modSessions) {
    for (const entry of mod.entries) {
      if (entry.score != null) {
        if (!scoreMap.has(entry.countryId)) scoreMap.set(entry.countryId, new Map());
        scoreMap.get(entry.countryId)!.set(mod.modNumber, entry.score);
      }
    }
  }

  if (modSessions.length === 0) {
    return <p className="text-muted">No Moderated Caucus rounds yet.</p>;
  }

  return (
    <div className="bg-panel border border-line rounded-shell shadow-sm overflow-x-auto">
      <table className="w-full border-collapse min-w-[700px]">
        <thead>
          <tr className="bg-wash2 border-b border-line">
            <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted px-4 py-3 sticky left-0 bg-wash2 whitespace-nowrap">
              Country
            </th>
            <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-3 whitespace-nowrap">
              Recognition
            </th>
            <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted px-3 py-3 whitespace-nowrap">
              Mod (Total)
            </th>
            {modSessions.map((mod) => (
              <th
                key={mod.id}
                className="text-center text-xs font-semibold uppercase tracking-wide text-muted px-3 py-3 whitespace-nowrap"
              >
                Mod {mod.modNumber}
                <div className="text-[10px] font-normal normal-case text-muted/70">/ 10</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {countries.map((country) => {
            const perMod = scoreMap.get(country.id) ?? new Map();
            const scores = modSessions.map((mod) => perMod.get(mod.modNumber) ?? null);
            const recognition = scores.filter((s) => s != null).length;
            const total = scores.reduce((sum: number, s) => sum + (s ?? 0), 0);

            return (
              <tr key={country.id} className="border-b border-line">
                <td className="px-4 py-2.5 font-semibold text-ink text-sm sticky left-0 bg-panel whitespace-nowrap">
                  {country.name}
                </td>
                <td className="px-3 py-2.5 font-medium text-ink">{recognition}</td>
                <td className="px-3 py-2.5 font-serif font-bold text-primary-deep text-lg">
                  {total}
                </td>
                {scores.map((score, i) => (
                  <td
                    key={modSessions[i].id}
                    className="px-3 py-2.5 text-center font-mono text-sm text-ink"
                  >
                    {score ?? <span className="text-muted/50">—</span>}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}