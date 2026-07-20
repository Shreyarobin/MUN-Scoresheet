import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/Shell";

export default async function GSLListPage({
  params,
}: {
  params: Promise<{ conferenceId: string; committeeId: string }>;
}) {
  const { conferenceId, committeeId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const committee = await prisma.committee.findUnique({
    where: { id: committeeId },
    include: {
      conference: true,
      gslQueueEntries: {
        orderBy: { orderIndex: "asc" },
        include: { country: true },
      },
      modSessions: {
        orderBy: { modNumber: "asc" },
        include: {
          entries: { include: { country: true }, orderBy: { orderIndex: "asc" } },
        },
      },
    },
  });

  if (!committee || committee.conference.ownerId !== user.id) notFound();

  const gslList = committee.gslQueueEntries;
  const mods = committee.modSessions;

  return (
    <Shell
      conferenceName={committee.conference.name}
      committeeName={committee.name}
      conferenceId={conferenceId}
      committeeId={committeeId}
    >
      <h1 className="text-2xl font-serif font-semibold text-ink mb-1">Lists</h1>
      <p className="text-muted mb-6">
        Speaking order and recognition status across GSL and every Moderated Caucus.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* GSL List */}
        <div className="bg-panel border border-line rounded-shell shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-serif font-semibold text-lg text-ink">GSL List</span>
            <span className="text-xs text-muted">{gslList.length} speakers</span>
          </div>

          {gslList.length === 0 ? (
            <p className="text-sm text-muted">No speakers queued yet.</p>
          ) : (
            <ul className="space-y-2">
              {gslList.map((entry, i) => {
                const spoken = entry.gsl1Score != null || entry.gsl2Score != null;
                const both = entry.gsl1Score != null && entry.gsl2Score != null;
                return (
                  <li key={entry.id} className="flex items-center gap-2 text-sm">
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 text-[10px] font-bold ${
                        both
                          ? "bg-gold border-gold text-white"
                          : spoken
                          ? "bg-success border-success text-white"
                          : "border-line2 bg-white"
                      }`}
                    >
                      {spoken && "✓"}
                    </span>
                    <span className="text-muted font-mono text-xs">{i + 1}.</span>
                    <span className="font-medium text-ink flex-1 truncate">
                      {entry.country.name}
                    </span>
                    {both && (
                      <span className="text-[10px] font-semibold uppercase text-gold-deep shrink-0">
                        Both
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* One card per Mod */}
        {mods.map((mod) => (
          <div key={mod.id} className="bg-panel border border-line rounded-shell shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="font-serif font-semibold text-lg text-ink">
                Mod {mod.modNumber} List
              </span>
              <span className="text-xs text-muted">{mod.entries.length} speakers</span>
            </div>
            <p className="text-xs text-muted mb-3 truncate">{mod.topic}</p>

            {mod.entries.length === 0 ? (
              <p className="text-sm text-muted">No speakers added yet.</p>
            ) : (
              <ul className="space-y-2">
                {mod.entries.map((entry, i) => {
                  const spoken = entry.score != null;
                  return (
                    <li key={entry.id} className="flex items-center gap-2 text-sm">
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 text-[10px] font-bold ${
                          spoken
                            ? "bg-success border-success text-white"
                            : "border-line2 bg-white"
                        }`}
                      >
                        {spoken && "✓"}
                      </span>
                      <span className="text-muted font-mono text-xs">{i + 1}.</span>
                      <span className="font-medium text-ink flex-1 truncate">
                        {entry.country.name}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}

        {mods.length === 0 && (
          <div className="bg-panel border border-dashed border-line2 rounded-shell p-5 flex items-center justify-center text-sm text-muted">
            No Moderated Caucus rounds yet.
          </div>
        )}
      </div>
    </Shell>
  );
}