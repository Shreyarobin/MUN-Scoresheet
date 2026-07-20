"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addToQueue(
  conferenceId: string,
  committeeId: string,
  countryId: string
) {
  const existing = await prisma.gSLQueueEntry.findUnique({
    where: { committeeId_countryId: { committeeId, countryId } },
  });
  if (existing) return; // already queued — second speech goes into GSL-II on the same row

  const count = await prisma.gSLQueueEntry.count({ where: { committeeId } });
  await prisma.gSLQueueEntry.create({
    data: { committeeId, countryId, orderIndex: count },
  });
  revalidatePath(`/dashboard/${conferenceId}/${committeeId}/gsl`);
}

export async function removeFromQueue(
  conferenceId: string,
  committeeId: string,
  entryId: string
) {
  await prisma.gSLQueueEntry.delete({ where: { id: entryId } });
  revalidatePath(`/dashboard/${conferenceId}/${committeeId}/gsl`);
}

export async function updateGSLScore(
  conferenceId: string,
  committeeId: string,
  entryId: string,
  round: 1 | 2,
  score: number | null
) {
  const clamped =
    score === null ? null : Math.max(0, Math.min(10, Math.round(score)));
  await prisma.gSLQueueEntry.update({
    where: { id: entryId },
    data: round === 1 ? { gsl1Score: clamped } : { gsl2Score: clamped },
  });
  revalidatePath(`/dashboard/${conferenceId}/${committeeId}/gsl`);
}

export async function updateGSLVerbatim(
  conferenceId: string,
  committeeId: string,
  entryId: string,
  round: 1 | 2,
  text: string
) {
  await prisma.gSLQueueEntry.update({
    where: { id: entryId },
    data: round === 1 ? { gsl1Verbatim: text } : { gsl2Verbatim: text },
  });
  revalidatePath(`/dashboard/${conferenceId}/${committeeId}/gsl`);
}
export async function resetGSLQueue(conferenceId: string, committeeId: string) {
  await prisma.gSLQueueEntry.deleteMany({ where: { committeeId } });
  revalidatePath(`/dashboard/${conferenceId}/${committeeId}/gsl`);
  revalidatePath(`/dashboard/${conferenceId}/${committeeId}/gsl/list`);
}