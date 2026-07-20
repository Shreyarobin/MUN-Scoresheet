import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/Shell";
import { GSLPageClient } from "./GSLPageClient";

export default async function GSLPage({
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
      <h1 className="text-2xl font-serif font-semibold text-ink mb-1">
        General Speakers List
      </h1>
      <p className="text-muted mb-6">
        Build the speaking order, then score and record each speech.
      </p>

      <GSLPageClient
        conferenceId={conferenceId}
        committeeId={committeeId}
        countries={committee.countries}
        queue={queue}
      />
    </Shell>
  );
}