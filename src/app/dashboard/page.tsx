import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function createCommittee(formData: FormData) {
  "use server";

  const conferenceId = formData.get("conferenceId") as string;
  const name = formData.get("name") as string;

  if (!name || !conferenceId) return;

  await prisma.committee.create({
    data: { name, conferenceId },
  });

  revalidatePath(`/dashboard/${conferenceId}`);
}

export default async function ConferencePage({
  params,
}: {
  params: Promise<{ conferenceId: string }>;
}) {
  const { conferenceId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const conference = await prisma.conference.findUnique({
    where: { id: conferenceId },
    include: { committees: true },
  });

  if (!conference || conference.ownerId !== user.id) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link href="/dashboard" className="text-primary-deep font-semibold hover:underline text-sm">
        ← Back to conferences
      </Link>

      <h1 className="text-3xl font-serif font-semibold text-ink mt-3 mb-6">
        {conference.name} <span className="text-muted font-sans font-normal">({conference.year})</span>
      </h1>

      <form
        action={createCommittee}
        className="flex gap-2 bg-panel border border-line rounded-shell shadow-sm p-4 mb-6"
      >
        <input type="hidden" name="conferenceId" value={conference.id} />
        <input
          type="text"
          name="name"
          placeholder="Committee name (e.g. UNSC, DISEC)"
          required
          className="flex-1 px-3 py-2.5 border border-line2 rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary"
        />
        <button
          type="submit"
          className="bg-primary hover:bg-primary-deep text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          Add Committee
        </button>
      </form>

      {conference.committees.length === 0 && (
        <p className="text-muted">No committees yet. Add your first one above.</p>
      )}

      <ul className="space-y-3">
        {conference.committees.map((committee) => (
          <li key={committee.id}>
            <Link
              href={`/dashboard/${conference.id}/${committee.id}`}
              className="flex items-center justify-between bg-panel border border-line rounded-shell shadow-sm p-4 hover:border-primary-soft hover:shadow-md transition-all"
            >
              <span className="font-semibold text-ink">{committee.name}</span>
              <span className="text-primary-deep">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}