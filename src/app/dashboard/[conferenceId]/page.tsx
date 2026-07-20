import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/Shell";
import { AddCountriesForm } from "./AddCountriesForm";
import { deleteCountry } from "./actions";

export default async function CommitteePage({
  params,
}: {
  params: Promise<{ conferenceId: string; committeeId: string }>;
}) {
  const { conferenceId, committeeId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const committee = await prisma.committee.findUnique({
    where: { id: committeeId },
    include: {
      conference: true,
      countries: { orderBy: { name: "asc" } },
    },
  });

  if (!committee || committee.conference.ownerId !== user.id) {
    notFound();
  }

  return (
    <Shell
      conferenceName={committee.conference.name}
      committeeName={committee.name}
      conferenceId={conferenceId}
      committeeId={committeeId}
    >
      <h1 className="text-2xl font-serif font-semibold text-ink mb-1">
        Committee Setup
      </h1>
      <p className="text-muted mb-6">
        {committee.countries.length} countries set up
      </p>

      <AddCountriesForm conferenceId={conferenceId} committeeId={committeeId} />

      {committee.countries.length === 0 ? (
        <p className="text-muted">No countries yet. Add your committee's roster above.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {committee.countries.map((country, i) => (
            <li
              key={country.id}
              className="fade-up flex items-center justify-between bg-panel border border-line rounded-shell shadow-sm px-4 py-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <span className="font-medium text-ink truncate pr-2">{country.name}</span>
              <form action={deleteCountry}>
                <input type="hidden" name="countryId" value={country.id} />
                <input type="hidden" name="conferenceId" value={conferenceId} />
                <input type="hidden" name="committeeId" value={committeeId} />
                <button
                  type="submit"
                  className="text-danger hover:underline text-sm font-medium shrink-0"
                >
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}