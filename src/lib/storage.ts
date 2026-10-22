import { randomBytes } from "node:crypto";
import { lstat, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_BYTES = 2 * 1024 * 1024;

export type ImageKind = "jpg" | "png" | "webp";

const KEY_PATTERN = /^[A-Za-z0-9_-]{20,80}\.(jpg|png|webp)$/;

const CONTENT_TYPES: Record<ImageKind, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export function storageRoot(): string {
  return path.resolve(process.cwd(), "storage");
}

export function sniffImage(bytes: Uint8Array): ImageKind | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "jpg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

export function isImageKey(key: string): boolean {
  return KEY_PATTERN.test(key);
}

export function contentTypeForKey(key: string): string | null {
  if (!isImageKey(key)) {
    return null;
  }
  const ext = key.slice(key.lastIndexOf(".") + 1) as ImageKind;
  return CONTENT_TYPES[ext] ?? null;
}

function resolvedFile(key: string): string {
  if (!isImageKey(key)) {
    throw new Error("invalid image key");
  }
  const root = storageRoot();
  const full = path.resolve(root, key);
  if (full !== path.join(root, key)) {
    throw new Error("invalid image key");
  }
  return full;
}

export async function writeImage(bytes: Uint8Array): Promise<string> {
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) {
    throw new Error("invalid image size");
  }
  const kind = sniffImage(bytes);
  if (!kind) {
    throw new Error("invalid image type");
  }
  const key = `${randomBytes(24).toString("base64url")}.${kind}`;
  const full = resolvedFile(key);
  await mkdir(storageRoot(), { recursive: true });
  const existing = await lstat(full).catch(() => null);
  if (existing) {
    throw new Error("image key collision");
  }
  await writeFile(full, bytes, { flag: "wx" });
  return key;
}

export async function readImage(key: string): Promise<Buffer> {
  const full = resolvedFile(key);
  const info = await lstat(full);
  if (!info.isFile()) {
    throw new Error("missing image");
  }
  return readFile(full);
}

export async function removeImage(key: string): Promise<void> {
  if (!isImageKey(key)) {
    return;
  }
  const full = resolvedFile(key);
  const info = await lstat(full).catch(() => null);
  if (!info || !info.isFile()) {
    return;
  }
  await unlink(full);
}

export const MAX_IMAGE_BYTES = MAX_BYTES;
export const MAX_UPLOAD_BODY_BYTES = MAX_BYTES + 32 * 1024;
