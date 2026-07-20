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
    },
  });

  if (!committee || committee.conference.ownerId !== user.id) notFound();

  const queue = committee.gslQueueEntries;

  return (
    <Shell
      conferenceName={committee.conference.name}
      committeeName={committee.name}
      conferenceId={conferenceId}
      committeeId={committeeId}
    >
      <h1 className="text-2xl font-serif font-semibold text-ink mb-1">GSL Lists</h1>
      <p className="text-muted mb-6">
        Speaking order with recognition status. Manage scores on the GSL page.
      </p>

      {queue.length === 0 ? (
        <p className="text-muted">No speakers queued yet. Add some from the GSL page.</p>
      ) : (
        <ul className="max-w-md space-y-2">
          {queue.map((entry, i) => {
            const spoken = entry.gsl1Score != null || entry.gsl2Score != null;
            const both = entry.gsl1Score != null && entry.gsl2Score != null;
            return (
              <li
                key={entry.id}
                className="flex items-center gap-3 bg-panel border border-line rounded-shell shadow-sm px-4 py-3"
              >
                <span
                  className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 text-xs font-bold ${
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
                <span className="font-medium text-ink flex-1">{entry.country.name}</span>
                {both && (
                  <span className="text-[10px] font-semibold uppercase text-gold-deep">
                    Both rounds
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Shell>
  );
}