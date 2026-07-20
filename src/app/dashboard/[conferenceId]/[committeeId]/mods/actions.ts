"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createModSession(
  conferenceId: string,
  committeeId: string,
  topic: string,
  countryIds: string[]
) {
  const lastMod = await prisma.modSession.findFirst({
    where: { committeeId },
    orderBy: { modNumber: "desc" },
  });
  const modNumber = (lastMod?.modNumber ?? 0) + 1;

  await prisma.modSession.create({
    data: {
      committeeId,
      modNumber,
      topic,
      entries: {
        create: countryIds.map((countryId, i) => ({ countryId, orderIndex: i })),
      },
    },
  });

  revalidatePath(`/dashboard/${conferenceId}/${committeeId}/mods`);
}

export async function addCountryToMod(
  conferenceId: string,
  committeeId: string,
  modSessionId: string,
  countryId: string
) {
  const existing = await prisma.modEntry.findUnique({
    where: { modSessionId_countryId: { modSessionId, countryId } },
  });
  if (existing) return;

  const count = await prisma.modEntry.count({ where: { modSessionId } });
  await prisma.modEntry.create({
    data: { modSessionId, countryId, orderIndex: count },
  });
  revalidatePath(`/dashboard/${conferenceId}/${committeeId}/mods`);
}

export async function removeFromMod(
  conferenceId: string,
  committeeId: string,
  entryId: string
) {
  await prisma.modEntry.delete({ where: { id: entryId } });
  revalidatePath(`/dashboard/${conferenceId}/${committeeId}/mods`);
}

export async function updateModScore(
  conferenceId: string,
  committeeId: string,
  entryId: string,
  score: number | null
) {
  await prisma.modEntry.update({ where: { id: entryId }, data: { score } });
  revalidatePath(`/dashboard/${conferenceId}/${committeeId}/mods`);
}

export async function updateModVerbatim(
  conferenceId: string,
  committeeId: string,
  entryId: string,
  text: string
) {
  await prisma.modEntry.update({ where: { id: entryId }, data: { verbatim: text } });
  revalidatePath(`/dashboard/${conferenceId}/${committeeId}/mods`);
}