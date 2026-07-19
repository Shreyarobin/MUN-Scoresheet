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
    data: {
      name,
      year,
      ownerId: user.id,
    },
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

  const inputStyle: React.CSSProperties = {
    padding: 8,
    color: "#000",
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: 4,
  };

  return (
    <div style={{ maxWidth: 700, margin: "60px auto", color: "#fff", fontFamily: "sans-serif" }}>
      <h1>Your Conferences</h1>
      <p style={{ opacity: 0.7 }}>Logged in as {user.email}</p>

      <form
        action={createConference}
        style={{
          display: "flex",
          gap: 8,
          margin: "24px 0",
          border: "1px solid #444",
          borderRadius: 6,
          padding: 16,
        }}
      >
        <input
          type="text"
          name="name"
          placeholder="Conference name (e.g. MUNSoc UniCon)"
          required
          style={{ ...inputStyle, flex: 2 }}
        />
        <input
          type="number"
          name="year"
          placeholder="Year"
          defaultValue={2026}
          required
          style={{ ...inputStyle, width: 100 }}
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
          Create
        </button>
      </form>

      {conferences.length === 0 && (
        <p style={{ marginTop: 24 }}>No conferences yet. Create your first one above.</p>
      )}

      <ul style={{ marginTop: 24, paddingLeft: 0, listStyle: "none" }}>
        {conferences.map((conf) => (
          <li
  key={conf.id}
  style={{
    border: "1px solid #444",
    borderRadius: 6,
    padding: 16,
    marginBottom: 12,
  }}
>
  <Link href={`/dashboard/${conf.id}`} style={{ color: "#fff", textDecoration: "none" }}>
    <strong>{conf.name}</strong> ({conf.year})
    <div style={{ opacity: 0.7, fontSize: 14 }}>
      {conf.committees.length} committee(s)
    </div>
  </Link>
</li>
        ))}
      </ul>
    </div>
  );
}