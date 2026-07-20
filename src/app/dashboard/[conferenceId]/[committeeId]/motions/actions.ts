"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function fileMotion(
  conferenceId: string,
  committeeId: string,
  dayIndex: number,
  raisedBy: string,
  motionType: string,
  topic: string,
  totalTimeMinutes: number | null,
  perSpeakerSeconds: number | null
) {
  await prisma.motion.create({
    data: {
      committeeId,
      dayIndex,
      raisedBy: raisedBy.trim(),
      motionType: motionType.trim(),
      topic: topic.trim() || null,
      totalTimeMinutes,
      perSpeakerSeconds,
    },
  });
  revalidatePath(`/dashboard/${conferenceId}/${committeeId}/motions`);
}

export async function updateMotionStatus(
  conferenceId: string,
  committeeId: string,
  motionId: string,
  status: "PENDING" | "PASS" | "FAIL" | "NOT_VOTED"
) {
  await prisma.motion.update({ where: { id: motionId }, data: { status } });
  revalidatePath(`/dashboard/${conferenceId}/${committeeId}/motions`);
}

export async function deleteMotion(conferenceId: string, committeeId: string, motionId: string) {
  await prisma.motion.delete({ where: { id: motionId } });
  revalidatePath(`/dashboard/${conferenceId}/${committeeId}/motions`);
}