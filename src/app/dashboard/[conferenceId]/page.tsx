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
    data: {
      name,
      conferenceId,
    },
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

  const inputStyle: React.CSSProperties = {
    padding: 8,
    color: "#000",
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: 4,
  };

  return (
    <div style={{ maxWidth: 700, margin: "60px auto", color: "#fff", fontFamily: "sans-serif" }}>
      <Link href="/dashboard" style={{ color: "#8ab4f8" }}>
        ← Back to conferences
      </Link>

      <h1 style={{ marginTop: 12 }}>
        {conference.name} ({conference.year})
      </h1>

      <form
        action={createCommittee}
        style={{
          display: "flex",
          gap: 8,
          margin: "24px 0",
          border: "1px solid #444",
          borderRadius: 6,
          padding: 16,
        }}
      >
        <input type="hidden" name="conferenceId" value={conference.id} />
        <input
          type="text"
          name="name"
          placeholder="Committee name (e.g. UNSC, DISEC)"
          required
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 16px",
            background: "#fff",
            color: "#000",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Add Committee
        </button>
      </form>

      {conference.committees.length === 0 && (
        <p>No committees yet. Add your first one above.</p>
      )}

      <ul style={{ paddingLeft: 0, listStyle: "none" }}>
        {conference.committees.map((committee) => (
          <li
            key={committee.id}
            style={{
              border: "1px solid #444",
              borderRadius: 6,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <Link
              href={`/dashboard/${conference.id}/${committee.id}`}
              style={{ color: "#fff", textDecoration: "none", fontWeight: 600 }}
            >
              {committee.name} →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}