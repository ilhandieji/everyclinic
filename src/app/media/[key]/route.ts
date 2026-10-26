import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAuthenticatedSession } from "@/lib/auth";
import { findPublicPhysician } from "@/lib/physician-site";
import prisma from "@/lib/prisma";
import { contentTypeForKey, isImageKey, readImage } from "@/lib/storage";

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string }> },
) {
  await connection();
  const { key } = await context.params;
  if (!isImageKey(key)) {
    return new NextResponse(null, { status: 404 });
  }

  const physician = await findPublicPhysician({
    id: true,
    userId: true,
    photoKey: true,
  });

  let allowed = physician?.photoKey === key;
  if (!allowed) {
    const service = await prisma.medicalService.findFirst({
      where: { imageKey: key },
      select: { published: true, physicianProfileId: true },
    });
    if (!service) {
      return new NextResponse(null, { status: 404 });
    }
    if (service.published) {
      allowed = true;
    } else if (physician && service.physicianProfileId === physician.id) {
      const session = await getServerSession(authOptions);
      allowed =
        isAuthenticatedSession(session) && session.user.id === physician.userId;
    }
  }

  if (!allowed) {
    return new NextResponse(null, { status: 404 });
  }

  const type = contentTypeForKey(key);
  if (!type) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const bytes = await readImage(key);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": type,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": "inline",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
