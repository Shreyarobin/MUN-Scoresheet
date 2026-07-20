import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/Shell";
import { RollCallBoard } from "./RollCallBoard";
import { DaySetupForm } from "./DaySetupForm";
import { ResetRollCallButton } from "./ResetRollCallButton";

export default async function RollCallPage({
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
      rollCallSessions: {
        orderBy: { dayIndex: "asc" },
        include: { entries: true },
      },
    },
  });

  if (!committee || committee.conference.ownerId !== user.id) notFound();

  const sessions = committee.rollCallSessions;

  return (
    <Shell
      conferenceName={committee.conference.name}
      committeeName={committee.name}
      conferenceId={conferenceId}
      committeeId={committeeId}
    >
      <h1 className="text-2xl font-serif font-semibold text-ink mb-1">Roll Call</h1>
      <p className="text-muted mb-6">
        Track attendance and voting rights across sessions.
      </p>

      {sessions.length > 0 && (
        <div className="mb-6">
          <ResetRollCallButton conferenceId={conferenceId} committeeId={committeeId} />
        </div>
      )}

      {sessions.length === 0 ? (
        <DaySetupForm conferenceId={conferenceId} committeeId={committeeId} />
      ) : (
        <RollCallBoard
          conferenceId={conferenceId}
          committeeId={committeeId}
          countries={committee.countries}
          sessions={sessions}
        />
      )}
    </Shell>
  );
}