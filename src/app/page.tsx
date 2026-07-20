import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function createConference(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = formData.get("name") as string;
  const year = parseInt(formData.get("year") as string, 10);

  if (!name || !year) return;

  await prisma.conference.create({
    data: { name, year, ownerId: user.id },
  });

  revalidatePath("/dashboard");
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const conferences = await prisma.conference.findMany({
    where: { ownerId: user.id },
    include: { committees: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-40 flex items-center gap-3 px-6 py-4 bg-panel/90 backdrop-blur border-b border-line">
        <div className="w-11 h-11 rounded-xl grid place-items-center font-serif font-bold text-white bg-gradient-to-br from-primary to-primary-deep shadow-md">
          MS
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider font-bold text-accent">
            MUN Scoresheet
          </div>
          <div className="text-lg font-semibold text-ink leading-tight">
            Your Conferences
          </div>
        </div>
        <div className="ml-auto text-sm text-muted">{user.email}</div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 fade-up">
        <form
          action={createConference}
          className="flex gap-3 bg-panel border border-line rounded-shell shadow-sm p-6 mb-8"
        >
          <input
            type="text"
            name="name"
            placeholder="Conference name (e.g. MUNSoc UniCon)"
            required
            className="flex-1 px-4 py-3 text-base border border-line2 rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary"
          />
          <input
            type="number"
            name="year"
            placeholder="Year"
            defaultValue={2026}
            required
            className="w-28 px-4 py-3 text-base border border-line2 rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-primary-deep active:scale-[0.98] text-white font-semibold px-6 py-3 rounded-lg transition-all whitespace-nowrap"
          >
            Create
          </button>
        </form>

        {conferences.length === 0 && (
          <p className="text-muted">No conferences yet. Create your first one above.</p>
        )}

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {conferences.map((conf, i) => (
            <li
              key={conf.id}
              className="fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <Link
                href={`/dashboard/${conf.id}`}
                className="block bg-panel border border-line rounded-shell shadow-sm p-5 hover:border-primary-soft hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <span className="font-serif font-semibold text-lg text-ink">
                  {conf.name}
                </span>{" "}
                <span className="text-muted text-sm">({conf.year})</span>
                <div className="text-sm text-muted mt-2">
                  {conf.committees.length} committee(s)
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}