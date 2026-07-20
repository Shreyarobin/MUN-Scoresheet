import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/Shell";
import { MotionsPageClient } from "./MotionsPageClient";

export default async function MotionsPage({
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
      motions: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!committee || committee.conference.ownerId !== user.id) notFound();

  return (
    <Shell
      conferenceName={committee.conference.name}
      committeeName={committee.name}
      conferenceId={conferenceId}
      committeeId={committeeId}
    >
      <h1 className="text-2xl font-serif font-semibold text-ink mb-1">Motions</h1>
      <p className="text-muted mb-6">
        File motions as they're raised, then record whether each passes.
      </p>

      <MotionsPageClient
        conferenceId={conferenceId}
        committeeId={committeeId}
        motions={committee.motions}
      />
    </Shell>
  );
}