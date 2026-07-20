import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/Shell";
import { RaisePooForm } from "./RaisePooForm";
import { PooTable } from "./PooTable";
import { PooLog } from "./PooLog";

export default async function PooPage({
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
      pooEntries: {
        orderBy: { poNumber: "asc" },
        include: { country: true },
      },
    },
  });

  if (!committee || committee.conference.ownerId !== user.id) notFound();

  const nextNumber = committee.pooEntries.length + 1;

  return (
    <Shell
      conferenceName={committee.conference.name}
      committeeName={committee.name}
      conferenceId={conferenceId}
      committeeId={committeeId}
    >
      <h1 className="text-2xl font-serif font-semibold text-ink mb-1">Points of Order</h1>
      <p className="text-muted mb-6">
        Record each Point of Order as it's raised, scored, and tallied across the committee.
      </p>

      <RaisePooForm
        conferenceId={conferenceId}
        committeeId={committeeId}
        countries={committee.countries}
        nextNumber={nextNumber}
      />

      <PooTable countries={committee.countries} entries={committee.pooEntries} />

      <PooLog
        conferenceId={conferenceId}
        committeeId={committeeId}
        entries={committee.pooEntries}
      />
    </Shell>
  );
}