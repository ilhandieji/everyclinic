import { NextResponse } from "next/server";
import {
  MAX_IMAGE_BYTES,
  MAX_UPLOAD_BODY_BYTES,
  writeImage,
} from "@/lib/storage";

export function bodyTooLarge(request: Request): NextResponse | null {
  const declared = Number(request.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > MAX_UPLOAD_BODY_BYTES) {
    return NextResponse.json(
      { error: "حجم فایل بیش از حد مجاز است." },
      { status: 413 },
    );
  }
  return null;
}

export async function bytesFromFile(file: FormDataEntryValue | null): Promise<
  | { ok: true; bytes: Uint8Array }
  | { ok: false; response: NextResponse }
> {
  if (!(file instanceof File)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "فایل را انتخاب کنید." }, { status: 400 }),
    };
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "حجم تصویر باید حداکثر ۲ مگابایت باشد." },
        { status: 413 },
      ),
    };
  }
  return { ok: true, bytes: new Uint8Array(await file.arrayBuffer()) };
}

export async function storeUpload(bytes: Uint8Array) {
  try {
    return { ok: true as const, key: await writeImage(bytes) };
  } catch {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "فقط تصویر jpeg، png یا webp پذیرفته می‌شود." },
        { status: 400 },
      ),
    };
  }
}
