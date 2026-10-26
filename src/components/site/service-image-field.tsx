"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
    <Card size="sm">
      <CardHeader>
        <CardTitle>تصویر</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {imageKey ? (
          <Image
            src={`/media/${imageKey}`}
            alt={title}
            width={640}
            height={320}
            unoptimized
            className="h-40 w-full rounded-lg object-cover"
          />
        ) : null}
        <Input
          id="service-image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            void onImage(file);
          }}
        />
        {uploading ? <p className="text-sm text-muted-foreground">در حال ذخیره تصویر</p> : null}
        {uploadError ? <FieldError>{uploadError}</FieldError> : null}
      </CardContent>
    </Card>
  );
}
