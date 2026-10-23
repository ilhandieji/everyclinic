"use client";

import Image from "next/image";
import { useActionState, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveProfile, type ActionState } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import {
  fieldControlInputClass,
  fieldControlTextareaClass,
  surfaceCardClass,
} from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp";

function pickImageFile(fileList: FileList | null | undefined): File | undefined {
  const file = fileList?.[0];
  if (!file) {
    return undefined;
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return undefined;
  }
  return file;
}

export function ProfileEditor({
  displayName,
  gender,
  bio,
  photoKey,
}: {
  displayName: string;
  gender: string;
  bio: string;
  photoKey: string | null;
}) {
  const router = useRouter();
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, action, pending] = useActionState(saveProfile, null as ActionState);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  async function onPhoto(file: File | undefined) {
    if (!file) {
      setUploadError("فقط JPG، PNG یا WebP مجاز است.");
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/uploads/profile", {
        method: "POST",
        body,
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setUploadError(data.error ?? "تصویر ذخیره نشد.");
        return;
      }
      router.refresh();
    } catch {
      setUploadError("تصویر ذخیره نشد.");
    } finally {
      setUploading(false);
    }
  }

  function onDropFile(file: File | undefined) {
    setDragActive(false);
    void onPhoto(file);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground">پروفایل عمومی</h1>
        <p className="text-sm text-muted-foreground">
          نام، معرفی و تصویر شما در صفحهٔ اصلی سایت برای بیماران نمایش داده می‌شود.
        </p>
      </header>

      <form className="flex flex-col gap-3" onSubmit={(event) => event.preventDefault()}>
        <div
          role="button"
          tabIndex={0}
          aria-labelledby={inputId}
          aria-disabled={uploading}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              if (!uploading) {
                fileInputRef.current?.click();
              }
            }
          }}
          onClick={() => {
            if (!uploading) {
              fileInputRef.current?.click();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            if (event.currentTarget.contains(event.relatedTarget as Node)) {
              return;
            }
            setDragActive(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            const file = pickImageFile(event.dataTransfer.files);
            onDropFile(file);
          }}
          className={cn(
            surfaceCardClass,
            "flex cursor-pointer flex-col items-center gap-4 p-6 text-center transition-colors",
            dragActive && "border-accent/60 bg-accent/5",
            uploading && "pointer-events-none opacity-70",
          )}
        >
          {photoKey ? (
            <Image
              src={`/media/${photoKey}`}
              alt={displayName || "تصویر پروفایل"}
              width={112}
              height={112}
              unoptimized
              className="size-28 rounded-full object-cover ring-2 ring-border/50"
            />
          ) : (
            <div
              className="flex size-28 items-center justify-center rounded-full border border-dashed border-border/80 bg-muted/50 text-muted-foreground"
              aria-hidden
            >
              <span className="text-xs">بدون تصویر</span>
            </div>
          )}
          <div id={inputId} className="flex flex-col gap-1 text-sm">
            <p className="font-medium text-foreground">
              تصویر پروفایل را اینجا رها کنید، یا برای انتخاب کلیک کنید.
            </p>
            <p className="text-muted-foreground">فقط JPG، PNG و WebP.</p>
          </div>
          <input
            ref={fileInputRef}
            id={`${inputId}-file`}
            name="file"
            type="file"
            accept={ACCEPT}
            disabled={uploading}
            className="sr-only"
            onChange={(event) => {
              const file = pickImageFile(event.target.files);
              event.target.value = "";
              void onPhoto(file);
            }}
          />
        </div>
        {uploading ? <p className="text-sm text-muted-foreground">در حال ذخیره تصویر</p> : null}
        {uploadError ? (
          <p role="alert" className="text-sm text-destructive">
            {uploadError}
          </p>
        ) : null}
      </form>

      <form action={action} className={cn(surfaceCardClass, "flex flex-col gap-4 p-5")}>
        <label className="flex flex-col gap-1.5 text-sm" htmlFor="display-name">
          نام
          <input
            id="display-name"
            name="displayName"
            defaultValue={displayName}
            maxLength={80}
            className={fieldControlInputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm" htmlFor="gender">
          جنسیت
          <input
            id="gender"
            name="gender"
            defaultValue={gender}
            maxLength={40}
            className={fieldControlInputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm" htmlFor="bio">
          معرفی
          <textarea
            id="bio"
            name="bio"
            defaultValue={bio}
            maxLength={4000}
            rows={6}
            className={fieldControlTextareaClass}
          />
        </label>
        {state?.ok === false ? (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        ) : null}
        {state?.ok ? (
          <p role="status" className="text-sm text-accent">
            ذخیره شد.
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "در حال ذخیره" : "ذخیره"}
        </Button>
      </form>
    </div>
  );
}
