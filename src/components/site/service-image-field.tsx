"use client";

import Image from "next/image";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { removeServiceImage } from "@/lib/actions/services";
import type { ActionState } from "@/lib/actions/state";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";

export function ServiceImageField({
  serviceId,
  title,
  imageKey,
}: {
  serviceId: string;
  title: string;
  imageKey: string | null;
}) {
  const router = useRouter();
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removeState, removeAction, removing] = useActionState(
    removeServiceImage,
    null as ActionState,
  );

  useEffect(() => {
    if (removeState?.ok) {
      router.refresh();
    }
  }, [removeState, router]);

  async function onImage(file: File | undefined) {
    if (!file) {
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("serviceId", serviceId);
      const response = await fetch("/api/uploads/service", { method: "POST", body });
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
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
      <h2 className="text-sm font-medium">تصویر</h2>
      {imageKey ? (
        <Image
          src={`/media/${imageKey}`}
          alt={title}
          width={640}
          height={320}
          unoptimized
          className="h-36 w-full rounded-lg object-cover"
        />
      ) : (
        <p className="text-sm text-muted-foreground">هنوز تصویری گذاشته نشده.</p>
      )}
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={uploading || removing}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void onImage(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        disabled={uploading || removing}
        onClick={() => fileInputRef.current?.click()}
      >
        {imageKey ? "تعویض تصویر" : "انتخاب تصویر"}
      </Button>
      {imageKey ? (
        <form
          action={removeAction}
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            if (!window.confirm("تصویر این خدمت حذف شود؟")) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={serviceId} />
          {removeState?.ok === false ? <FieldError>{removeState.error}</FieldError> : null}
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            className="w-fit"
            disabled={uploading || removing}
          >
            {removing ? "در حال حذف" : "حذف تصویر"}
          </Button>
        </form>
      ) : null}
      {uploading ? <p className="text-sm text-muted-foreground">در حال ذخیره تصویر</p> : null}
      {uploadError ? <FieldError>{uploadError}</FieldError> : null}
    </div>
  );
}
