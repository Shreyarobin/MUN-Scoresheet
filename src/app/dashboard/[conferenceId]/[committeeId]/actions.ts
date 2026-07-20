"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type AddCountriesState = {
  added: string[];
  duplicates: string[];
} | null;

export async function addCountries(
  prevState: AddCountriesState,
  formData: FormData
): Promise<AddCountriesState> {
  const committeeId = formData.get("committeeId") as string;
  const conferenceId = formData.get("conferenceId") as string;
  const raw = formData.get("countries") as string;

  if (!raw || !committeeId) return null;

  const incoming = raw
    .split(/[\n,]/)
    .map((n) => n.trim())
    .filter((n) => n.length > 0);

  if (incoming.length === 0) return null;

  const existing = await prisma.country.findMany({
    where: { committeeId },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((c) => c.name.toLowerCase()));

  const seen = new Set<string>();
  const toAdd: string[] = [];
  const duplicates: string[] = [];

  for (const name of incoming) {
    const key = name.toLowerCase();
    if (existingNames.has(key) || seen.has(key)) {
      duplicates.push(name);
    } else {
      seen.add(key);
      toAdd.push(name);
    }
  }

  if (toAdd.length > 0) {
    const existingCount = await prisma.country.count({ where: { committeeId } });
    await prisma.country.createMany({
      data: toAdd.map((name, i) => ({
        name,
        committeeId,
        orderIndex: existingCount + i,
      })),
    });
  }

  revalidatePath(`/dashboard/${conferenceId}/${committeeId}`);

  return { added: toAdd, duplicates };
}

export async function deleteCountry(formData: FormData) {
  const countryId = formData.get("countryId") as string;
  const conferenceId = formData.get("conferenceId") as string;
  const committeeId = formData.get("committeeId") as string;

  await prisma.country.delete({ where: { id: countryId } });

  revalidatePath(`/dashboard/${conferenceId}/${committeeId}`);
}
