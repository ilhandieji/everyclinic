"use client";

import Image from "next/image";
import { useActionState, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveProfile } from "@/lib/actions/profile";
import type { ActionState } from "@/lib/actions/state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";
import { SiteShell, siteFormClass } from "@/components/layout/site-shell";
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
  const [genderValue, setGenderValue] = useState(
    gender === "مرد" || gender === "زن" ? gender : "",
  );

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
    <SiteShell className="flex flex-col gap-8">
      <PageHeader
        title="پروفایل عمومی"
        lede="نام، معرفی و تصویر شما در صفحهٔ اصلی سایت برای بیماران نمایش داده می‌شود."
      />

      <Card className={siteFormClass}>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-[10.5rem_minmax(0,1fr)]">
            <form
              className="flex flex-col gap-2 md:row-span-1"
              onSubmit={(event) => event.preventDefault()}
            >
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
                  "flex cursor-pointer flex-col items-center gap-3 rounded-lg p-3 text-center ring-1 ring-border transition-colors",
                  dragActive && "bg-accent/40 ring-primary/40",
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
                    className="flex size-28 items-center justify-center rounded-full border border-dashed border-border bg-muted/50 text-muted-foreground"
                    aria-hidden
                  >
                    <span className="text-xs">بدون تصویر</span>
                  </div>
                )}
                <div id={inputId} className="flex flex-col gap-0.5 text-xs">
                  <p className="font-medium text-foreground">تغییر تصویر</p>
                  <p className="text-muted-foreground">JPG، PNG یا WebP</p>
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
              {uploading ? (
                <p className="text-sm text-muted-foreground">در حال ذخیره تصویر</p>
              ) : null}
              {uploadError ? (
                <p role="alert" className="text-sm text-destructive">
                  {uploadError}
                </p>
              ) : null}
            </form>

            <form id="profile-details" action={action} className="min-w-0">
              <input type="hidden" name="gender" value={genderValue} />
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8.5rem]">
                  <Field>
                    <FieldLabel htmlFor="display-name">نام</FieldLabel>
                    <Input
                      id="display-name"
                      name="displayName"
                      defaultValue={displayName}
                      maxLength={80}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="gender">جنسیت</FieldLabel>
                    <Select
                      value={genderValue === "" ? undefined : genderValue}
                      onValueChange={setGenderValue}
                    >
                      <SelectTrigger id="gender" className="w-full">
                        <SelectValue placeholder="انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="مرد">مرد</SelectItem>
                          <SelectItem value="زن">زن</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="bio">معرفی</FieldLabel>
                  <Textarea
                    id="bio"
                    name="bio"
                    defaultValue={bio}
                    maxLength={4000}
                    rows={8}
                    className="min-h-40"
                  />
                </Field>
                {state?.ok === false ? <FieldError>{state.error}</FieldError> : null}
                {state?.ok ? (
                  <p role="status" className="text-sm text-foreground">
                    ذخیره شد.
                  </p>
                ) : null}
              </FieldGroup>
            </form>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" form="profile-details" disabled={pending}>
            {pending ? "در حال ذخیره" : "ذخیره"}
          </Button>
        </CardFooter>
      </Card>
    </SiteShell>
  );
}
