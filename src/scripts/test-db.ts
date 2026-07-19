import { prisma } from "../lib/prisma";

async function main() {
  const conference = await prisma.conference.create({
    data: {
      name: "Test Conference",
      year: 2026,
      ownerId: "test-user",
    },
  });
  console.log("Created:", conference);

  const all = await prisma.conference.findMany();
  console.log("All conferences:", all);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());