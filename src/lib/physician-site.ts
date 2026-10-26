import type { Prisma } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";

export function findPublicPhysician<S extends Prisma.PhysicianProfileSelect>(
  select: S,
) {
  return prisma.physicianProfile.findUnique({
    where: { singleton: 1 },
    select,
  });
}
