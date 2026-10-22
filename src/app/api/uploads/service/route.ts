import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connection } from "next/server";
import { currentPhysician } from "@/lib/access";
import prisma from "@/lib/prisma";
import { removeImage } from "@/lib/storage";
import { bodyTooLarge, bytesFromFile, storeUpload } from "@/lib/uploads";

export async function POST(request: Request) {
  await connection();
  const physician = await currentPhysician();
  if (!physician) {
    return NextResponse.json({ error: "اجازه این کار را ندارید." }, { status: 403 });
  }

  const tooLarge = bodyTooLarge(request);
  if (tooLarge) {
    return tooLarge;
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "فایل دریافت نشد." }, { status: 400 });
  }

  const serviceId = form.get("serviceId");
  if (typeof serviceId !== "string" || serviceId.length === 0 || serviceId.length > 64) {
    return NextResponse.json({ error: "خدمت نامعتبر است." }, { status: 400 });
  }

  const service = await prisma.medicalService.findFirst({
    where: { id: serviceId, physicianProfileId: physician.id },
    select: { id: true, imageKey: true },
  });
  if (!service) {
    return NextResponse.json({ error: "اجازه این کار را ندارید." }, { status: 403 });
  }

  const incoming = await bytesFromFile(form.get("file"));
  if (!incoming.ok) {
    return incoming.response;
  }
  const stored = await storeUpload(incoming.bytes);
  if (!stored.ok) {
    return stored.response;
  }

  try {
    await prisma.medicalService.update({
      where: { id: service.id },
      data: { imageKey: stored.key },
    });
  } catch {
    await removeImage(stored.key);
    return NextResponse.json({ error: "تصویر ذخیره نشد." }, { status: 500 });
  }

  if (service.imageKey && service.imageKey !== stored.key) {
    const [services, photos] = await Promise.all([
      prisma.medicalService.count({ where: { imageKey: service.imageKey } }),
      prisma.physicianProfile.count({ where: { photoKey: service.imageKey } }),
    ]);
    if (services + photos === 0) {
      await removeImage(service.imageKey);
    }
  }

  revalidatePath(`/services/${service.id}`);
  revalidatePath("/services");
  revalidatePath(`/manage/services/${service.id}`);
  return NextResponse.json({ ok: true });
}
