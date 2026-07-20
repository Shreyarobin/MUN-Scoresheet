import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/Shell";
import { ModsPageClient } from "./ModsPageClient";

export default async function ModsPage({
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
      countries: { orderBy: { name: "asc" } },
      modSessions: {
        orderBy: { modNumber: "asc" },
        include: {
          entries: { include: { country: true }, orderBy: { orderIndex: "asc" } },
        },
      },
    },
  });

  if (!committee || committee.conference.ownerId !== user.id) notFound();

  const recognition: Record<string, number> = {};
  const modTotal: Record<string, number> = {};
  const modMembership: Record<string, number[]> = {};

  for (const session of committee.modSessions) {
    for (const entry of session.entries) {
      // List membership — counts regardless of whether a score was entered yet
      (modMembership[entry.countryId] ??= []).push(session.modNumber);

      if (entry.score != null) {
        recognition[entry.countryId] = (recognition[entry.countryId] ?? 0) + 1;
        modTotal[entry.countryId] = (modTotal[entry.countryId] ?? 0) + entry.score;
      }
    }
  }

  return (
    <Shell
      conferenceName={committee.conference.name}
      committeeName={committee.name}
      conferenceId={conferenceId}
      committeeId={committeeId}
    >
      <h1 className="text-2xl font-serif font-semibold text-ink mb-1">Moderated Caucus</h1>
      <p className="text-muted mb-6">
        Create moderated caucus rounds, build each speaking list, then score and record.
      </p>

      <ModsPageClient
        conferenceId={conferenceId}
        committeeId={committeeId}
        countries={committee.countries}
        modSessions={committee.modSessions}
        recognitionMap={recognition}
        recognizedModsMap={modMembership}
        modTotalMap={modTotal}
      />
    </Shell>
  );
}