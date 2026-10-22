"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteService } from "@/lib/actions/services";
import type { ActionState } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";

type SectionDraft = { title: string; body: string };

type ServiceDraft = {
  id: string;
  title: string;
  description: string;
  priceMin: number | null;
  priceMax: number | null;
  currencyLabel: string | null;
  published: boolean;
  sortOrder: number;
  imageKey: string | null;
  sections: SectionDraft[];
};

export function ServiceForm({
  action,
  service,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  service?: ServiceDraft;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, null as ActionState);
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteService,
    null as ActionState,
  );
  const [sections, setSections] = useState<SectionDraft[]>(service?.sections ?? []);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onImage(file: File | undefined) {
    if (!file || !service) {
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("serviceId", service.id);
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
    <div className="flex flex-col gap-8">
      <form action={formAction} className="flex flex-col gap-4">
        {service ? <input type="hidden" name="id" value={service.id} /> : null}
        <input type="hidden" name="sections" value={JSON.stringify(sections)} />
        <label className="flex flex-col gap-1 text-sm" htmlFor="service-title">
          نام
          <input
            id="service-title"
            name="title"
            required
            maxLength={120}
            defaultValue={service?.title ?? ""}
            className="h-10 rounded-md border border-input bg-transparent px-3"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm" htmlFor="service-description">
          توضیحات
          <textarea
            id="service-description"
            name="description"
            rows={5}
            maxLength={8000}
            defaultValue={service?.description ?? ""}
            className="rounded-md border border-input bg-transparent px-3 py-2"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm" htmlFor="price-min">
            حداقل قیمت
            <input
              id="price-min"
              name="priceMin"
              inputMode="numeric"
              dir="ltr"
              lang="en"
              defaultValue={service?.priceMin ?? ""}
              className="h-10 rounded-md border border-input bg-transparent px-3 text-start"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm" htmlFor="price-max">
            حداکثر قیمت
            <input
              id="price-max"
              name="priceMax"
              inputMode="numeric"
              dir="ltr"
              lang="en"
              defaultValue={service?.priceMax ?? ""}
              className="h-10 rounded-md border border-input bg-transparent px-3 text-start"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm" htmlFor="currency-label">
          واحد پول
          <input
            id="currency-label"
            name="currencyLabel"
            maxLength={32}
            defaultValue={service?.currencyLabel ?? ""}
            className="h-10 rounded-md border border-input bg-transparent px-3"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm" htmlFor="sort-order">
          ترتیب نمایش
          <input
            id="sort-order"
            name="sortOrder"
            type="number"
            min={0}
            max={10000}
            dir="ltr"
            defaultValue={service?.sortOrder ?? 0}
            className="h-10 w-28 rounded-md border border-input bg-transparent px-3"
          />
        </label>
        <label className="flex items-center gap-2 text-sm" htmlFor="published">
          <input
            id="published"
            name="published"
            type="checkbox"
            defaultChecked={service?.published ?? false}
          />
          نمایش در صفحه خدمات
        </label>

        <fieldset className="flex flex-col gap-3 border border-border p-3">
          <legend className="px-1 text-sm">بخش‌های سفارشی</legend>
          {sections.map((section, index) => (
            <div key={index} className="flex flex-col gap-2 border border-border p-3">
              <label className="flex flex-col gap-1 text-sm" htmlFor={`section-title-${index}`}>
                عنوان
                <input
                  id={`section-title-${index}`}
                  value={section.title}
                  maxLength={120}
                  onChange={(event) => {
                    const next = sections.slice();
                    next[index] = { ...section, title: event.target.value };
                    setSections(next);
                  }}
                  className="h-10 rounded-md border border-input bg-transparent px-3"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm" htmlFor={`section-body-${index}`}>
                توضیحات
                <textarea
                  id={`section-body-${index}`}
                  value={section.body}
                  maxLength={4000}
                  rows={4}
                  onChange={(event) => {
                    const next = sections.slice();
                    next[index] = { ...section, body: event.target.value };
                    setSections(next);
                  }}
                  className="rounded-md border border-input bg-transparent px-3 py-2"
                />
              </label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSections(sections.filter((_, item) => item !== index))}
              >
                حذف بخش
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setSections([...sections, { title: "", body: "" }])}
          >
            افزودن بخش
          </Button>
        </fieldset>

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

      {service ? (
        <form className="flex flex-col gap-3 border-t border-border pt-6">
          <label className="text-sm" htmlFor="service-image">
            تصویر
          </label>
          {service.imageKey ? (
            <Image
              src={`/media/${service.imageKey}`}
              alt={service.title}
              width={640}
              height={320}
              unoptimized
              className="h-40 w-full max-w-sm object-cover"
            />
          ) : null}
          <input
            id="service-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void onImage(file);
            }}
            className="text-sm"
          />
          {uploading ? <p className="text-sm text-muted-foreground">در حال ذخیره تصویر</p> : null}
          {uploadError ? (
            <p role="alert" className="text-sm text-destructive">
              {uploadError}
            </p>
          ) : null}
        </form>
      ) : null}

      {service ? (
        <form
          action={deleteAction}
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            if (!window.confirm("این خدمت حذف شود؟")) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={service.id} />
          {deleteState?.ok === false ? (
            <p role="alert" className="text-sm text-destructive">
              {deleteState.error}
            </p>
          ) : null}
          <Button type="submit" variant="destructive" disabled={deleting}>
            حذف خدمت
          </Button>
        </form>
      ) : null}
    </div>
  );
}
