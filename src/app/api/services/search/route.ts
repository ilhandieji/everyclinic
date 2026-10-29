import { NextResponse } from "next/server";
import { connection } from "next/server";
import { findPublicPhysician } from "@/lib/physician-site";
import prisma from "@/lib/prisma";

const MAX_RESULTS = 8;

export async function GET(request: Request) {
  await connection();
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  const physician = await findPublicPhysician({ id: true });
  if (!physician) {
    return NextResponse.json({ services: [] });
  }

  const services = await prisma.medicalService.findMany({
    where: {
      physicianProfileId: physician.id,
      published: true,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: { id: true, title: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    take: MAX_RESULTS,
  });

  return NextResponse.json({ services });
}
