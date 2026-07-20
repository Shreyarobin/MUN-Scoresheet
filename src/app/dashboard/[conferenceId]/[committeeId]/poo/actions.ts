"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function raisePoo(
  conferenceId: string,
  committeeId: string,
  countryId: string,
  score: number,
  raisedDuring: string,
  comments: string
) {
  const count = await prisma.pooEntry.count({ where: { committeeId } });
  await prisma.pooEntry.create({
    data: {
      committeeId,
      countryId,
      poNumber: count + 1,
      score,
      raisedDuring: raisedDuring.trim(),
      comments: comments.trim() || null,
    },
  });

  revalidatePath(`/dashboard/${conferenceId}/${committeeId}/poo`);
}

export async function deletePoo(conferenceId: string, committeeId: string, entryId: string) {
  await prisma.pooEntry.delete({ where: { id: entryId } });
  revalidatePath(`/dashboard/${conferenceId}/${committeeId}/poo`);
}