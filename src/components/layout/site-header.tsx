import { connection } from "next/server";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { currentPhysician } from "@/lib/access";
import prisma from "@/lib/prisma";

export async function SiteHeader() {
  await connection();
  let brand = "";
  let physician = false;
  let showServices = false;
  try {
    const [profile, published, sessionPhysician] = await Promise.all([
      prisma.physicianProfile.findFirst({
        select: { displayName: true },
      }),
      prisma.medicalService.count({ where: { published: true } }),
      currentPhysician(),
    ]);
    brand = profile?.displayName?.trim() ?? "";
    physician = Boolean(sessionPhysician);
    showServices = physician || published > 0;
  } catch {
    brand = "";
  }

  return (
    <SiteNavbar brand={brand} physician={physician} showServices={showServices} />
  );
}
