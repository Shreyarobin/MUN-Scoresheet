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
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-serif font-semibold text-ink mb-1">
        Your Conferences
      </h1>
      <p className="text-muted mb-6">Logged in as {user.email}</p>

      <form
        action={createConference}
        className="flex gap-2 bg-panel border border-line rounded-shell shadow-sm p-4 mb-6"
      >
        <input
          type="text"
          name="name"
          placeholder="Conference name (e.g. MUNSoc UniCon)"
          required
          className="flex-1 px-3 py-2.5 border border-line2 rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary"
        />
        <input
          type="number"
          name="year"
          placeholder="Year"
          defaultValue={2026}
          required
          className="w-24 px-3 py-2.5 border border-line2 rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary"
        />
        <button
          type="submit"
          className="bg-primary hover:bg-primary-deep text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          Create
        </button>
      </form>

      {conferences.length === 0 && (
        <p className="text-muted">No conferences yet. Create your first one above.</p>
      )}

      <ul className="space-y-3">
        {conferences.map((conf) => (
          <li key={conf.id}>
            <Link
              href={`/dashboard/${conf.id}`}
              className="block bg-panel border border-line rounded-shell shadow-sm p-4 hover:border-primary-soft hover:shadow-md transition-all"
            >
              <span className="font-semibold text-ink">{conf.name}</span>{" "}
              <span className="text-muted">({conf.year})</span>
              <div className="text-sm text-muted mt-1">
                {conf.committees.length} committee(s)
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}