import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function addCountries(formData: FormData) {
  "use server";

  const committeeId = formData.get("committeeId") as string;
  const conferenceId = formData.get("conferenceId") as string;
  const raw = formData.get("countries") as string;

  if (!raw || !committeeId) return;

  // Split on newlines or commas, trim, drop empties
  const names = raw
    .split(/[\n,]/)
    .map((n) => n.trim())
    .filter((n) => n.length > 0);

  if (names.length === 0) return;

  const existingCount = await prisma.country.count({
    where: { committeeId },
  });

  await prisma.country.createMany({
    data: names.map((name, i) => ({
      name,
      committeeId,
      orderIndex: existingCount + i,
    })),
  });

  revalidatePath(`/dashboard/${conferenceId}/${committeeId}`);
}

async function deleteCountry(formData: FormData) {
  "use server";

  const countryId = formData.get("countryId") as string;
  const conferenceId = formData.get("conferenceId") as string;
  const committeeId = formData.get("committeeId") as string;

  await prisma.country.delete({ where: { id: countryId } });

  revalidatePath(`/dashboard/${conferenceId}/${committeeId}`);
}

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
      countries: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!committee || committee.conference.ownerId !== user.id) {
    notFound();
  }

  return (
    <div style={{ maxWidth: 700, margin: "60px auto", color: "#fff", fontFamily: "sans-serif" }}>
      <Link href={`/dashboard/${conferenceId}`} style={{ color: "#8ab4f8" }}>
        ← Back to {committee.conference.name}
      </Link>

      <h1 style={{ marginTop: 12 }}>{committee.name}</h1>
      <p style={{ opacity: 0.7 }}>
        {committee.countries.length} countries set up
      </p>

      <form
        action={addCountries}
        style={{
          margin: "24px 0",
          border: "1px solid #444",
          borderRadius: 6,
          padding: 16,
        }}
      >
        <input type="hidden" name="committeeId" value={committee.id} />
        <input type="hidden" name="conferenceId" value={conferenceId} />
        <label style={{ display: "block", marginBottom: 8 }}>
          Add countries (one per line, or comma-separated)
        </label>
        <textarea
          name="countries"
          rows={6}
          placeholder={"United States\nRussian Federation\nChina\nUnited Kingdom"}
          style={{
            width: "100%",
            padding: 8,
            color: "#000",
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 4,
            fontFamily: "inherit",
            resize: "vertical",
          }}
        />
        <button
          type="submit"
          style={{
            marginTop: 8,
            padding: "8px 16px",
            background: "#fff",
            color: "#000",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Add Countries
        </button>
      </form>

      {committee.countries.length === 0 ? (
        <p>No countries yet. Add your committee's roster above.</p>
      ) : (
        <ul style={{ paddingLeft: 0, listStyle: "none" }}>
          {committee.countries.map((country) => (
            <li
              key={country.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #444",
                borderRadius: 6,
                padding: "10px 16px",
                marginBottom: 8,
              }}
            >
              <span>{country.name}</span>
              <form action={deleteCountry}>
                <input type="hidden" name="countryId" value={country.id} />
                <input type="hidden" name="conferenceId" value={conferenceId} />
                <input type="hidden" name="committeeId" value={committeeId} />
                <button
                  type="submit"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ff6b6b",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}