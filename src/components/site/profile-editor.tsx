"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { saveProfile, type ActionState } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";

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
  const [state, action, pending] = useActionState(saveProfile, null as ActionState);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onPhoto(file: File | undefined) {
    if (!file) {
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

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <form className="flex flex-col gap-3" onSubmit={(event) => event.preventDefault()}>
        <label className="text-sm text-foreground" htmlFor="profile-photo">
          تصویر
        </label>
        <div className="flex flex-wrap items-center gap-4">
          {photoKey ? (
            <Image
              src={`/media/${photoKey}`}
              alt={displayName || "تصویر"}
              width={96}
              height={96}
              unoptimized
              className="size-24 rounded-full object-cover"
            />
          ) : (
            <div
              className="size-24 rounded-full border border-dashed border-border bg-muted"
              aria-hidden
            />
          )}
          <input
            id="profile-photo"
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void onPhoto(file);
            }}
            className="text-sm text-foreground"
          />
        </div>
        {uploading ? <p className="text-sm text-muted-foreground">در حال ذخیره تصویر</p> : null}
        {uploadError ? (
          <p role="alert" className="text-sm text-destructive">
            {uploadError}
          </p>
        ) : null}
      </form>

      <form action={action} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm" htmlFor="display-name">
          نام
          <input
            id="display-name"
            name="displayName"
            defaultValue={displayName}
            maxLength={80}
            className="h-10 rounded-md border border-input bg-transparent px-3"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm" htmlFor="gender">
          جنسیت
          <input
            id="gender"
            name="gender"
            defaultValue={gender}
            maxLength={40}
            className="h-10 rounded-md border border-input bg-transparent px-3"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm" htmlFor="bio">
          معرفی
          <textarea
            id="bio"
            name="bio"
            defaultValue={bio}
            maxLength={4000}
            rows={6}
            className="rounded-md border border-input bg-transparent px-3 py-2"
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
