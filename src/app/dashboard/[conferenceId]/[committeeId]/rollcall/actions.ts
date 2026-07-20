"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRollCallDays(
  conferenceId: string,
  committeeId: string,
  numberOfDays: number
) {
  const existing = await prisma.rollCallSession.count({ where: { committeeId } });
  if (existing > 0) return;

  const days = Array.from({ length: numberOfDays }, (_, i) => ({
    committeeId,
    dayIndex: i + 1,
    label: `Day ${i + 1}`,
  }));

  await prisma.rollCallSession.createMany({ data: days });
  revalidatePath(`/dashboard/${conferenceId}/${committeeId}/rollcall`);
}

const CYCLE_UNLOCKED = ["ABSENT", "PRESENT", "PRESENT_VOTING"];
const CYCLE_LOCKED = ["ABSENT", "PRESENT_VOTING"];

export async function cycleStatus(
  conferenceId: string,
  committeeId: string,
  sessionId: string,
  countryId: string
) {
  const session = await prisma.rollCallSession.findUnique({
    where: { id: sessionId },
  });
  if (!session || session.committed) return;

  const country = await prisma.country.findUnique({ where: { id: countryId } });
  if (!country) return;

  const cycle = country.everPresentVoting ? CYCLE_LOCKED : CYCLE_UNLOCKED;

  const existing = await prisma.rollCallEntry.findUnique({
    where: { sessionId_countryId: { sessionId, countryId } },
  });
  const current = existing?.status ?? "ABSENT";
  const currentIdx = cycle.indexOf(current);
  const next = cycle[(currentIdx + 1) % cycle.length];

  await prisma.rollCallEntry.upsert({
    where: { sessionId_countryId: { sessionId, countryId } },
    update: { status: next },
    create: { sessionId, countryId, status: next },
  });

  if (next === "PRESENT_VOTING" && !country.everPresentVoting) {
    await prisma.country.update({
      where: { id: countryId },
      data: { everPresentVoting: true },
    });
  }

  revalidatePath(`/dashboard/${conferenceId}/${committeeId}/rollcall`);
}

export async function commitSession(
  conferenceId: string,
  committeeId: string,
  sessionId: string
) {
  await prisma.rollCallSession.update({
    where: { id: sessionId },
    data: { committed: true, committedAt: new Date() },
  });
  revalidatePath(`/dashboard/${conferenceId}/${committeeId}/rollcall`);
}
export async function resetRollCall(conferenceId: string, committeeId: string) {
  await prisma.rollCallSession.deleteMany({ where: { committeeId } });
  await prisma.country.updateMany({
    where: { committeeId },
    data: { everPresentVoting: false },
  });
  revalidatePath(`/dashboard/${conferenceId}/${committeeId}/rollcall`);
}