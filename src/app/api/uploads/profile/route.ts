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

  const incoming = await bytesFromFile(form.get("file"));
  if (!incoming.ok) {
    return incoming.response;
  }
  const stored = await storeUpload(incoming.bytes);
  if (!stored.ok) {
    return stored.response;
  }

  const previous = physician.photoKey;
  try {
    await prisma.physicianProfile.update({
      where: { id: physician.id },
      data: { photoKey: stored.key },
    });
  } catch {
    await removeImage(stored.key);
    return NextResponse.json({ error: "تصویر ذخیره نشد." }, { status: 500 });
  }

  if (previous && previous !== stored.key) {
    const stillUsed = await prisma.medicalService.count({
      where: { imageKey: previous },
    });
    if (stillUsed === 0) {
      await removeImage(previous);
    }
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
