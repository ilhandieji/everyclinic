"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteService } from "@/lib/actions/services";
import type { ActionState } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
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
import { currencyLabels } from "@/lib/validators/site";

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

function knownCurrency(value: string | null | undefined) {
  return currencyLabels.find((label) => label === value) ?? "";
}

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
  const [currency, setCurrency] = useState(knownCurrency(service?.currencyLabel));
  const [published, setPublished] = useState(service?.published ?? false);
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
    <div className="flex max-w-3xl flex-col gap-8">
      <form action={formAction}>
        {service ? <input type="hidden" name="id" value={service.id} /> : null}
        <input type="hidden" name="sections" value={JSON.stringify(sections)} />
        <input type="hidden" name="currencyLabel" value={currency} />
        <input type="hidden" name="published" value={published ? "on" : ""} />
        <FieldGroup>
          <Field className="max-w-md">
            <FieldLabel htmlFor="service-title">نام</FieldLabel>
            <Input
              id="service-title"
              name="title"
              required
              maxLength={120}
              defaultValue={service?.title ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="service-description">توضیحات</FieldLabel>
            <Textarea
              id="service-description"
              name="description"
              rows={5}
              maxLength={8000}
              defaultValue={service?.description ?? ""}
            />
          </Field>
          <FieldGroup className="sm:flex-row sm:items-end">
            <Field className="sm:max-w-36">
              <FieldLabel htmlFor="price-min">حداقل قیمت</FieldLabel>
              <Input
                id="price-min"
                name="priceMin"
                inputMode="numeric"
                dir="ltr"
                lang="en"
                defaultValue={service?.priceMin ?? ""}
              />
            </Field>
            <Field className="sm:max-w-36">
              <FieldLabel htmlFor="price-max">حداکثر قیمت</FieldLabel>
              <Input
                id="price-max"
                name="priceMax"
                inputMode="numeric"
                dir="ltr"
                lang="en"
                defaultValue={service?.priceMax ?? ""}
              />
            </Field>
            <Field className="sm:max-w-32">
              <FieldLabel htmlFor="currency-label">واحد پول</FieldLabel>
              <Select
                value={currency === "" ? undefined : currency}
                onValueChange={setCurrency}
              >
                <SelectTrigger id="currency-label" className="w-full">
                  <SelectValue placeholder="انتخاب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {currencyLabels.map((label) => (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field className="sm:max-w-24">
              <FieldLabel htmlFor="sort-order">ترتیب نمایش</FieldLabel>
              <Input
                id="sort-order"
                name="sortOrder"
                type="number"
                min={0}
                max={10000}
                dir="ltr"
                defaultValue={service?.sortOrder ?? 0}
              />
            </Field>
          </FieldGroup>
          <Field orientation="horizontal" className="w-fit">
            <Checkbox
              id="published"
              checked={published}
              onCheckedChange={(checked) => setPublished(checked === true)}
            />
            <FieldLabel htmlFor="published">نمایش در صفحه خدمات</FieldLabel>
          </Field>

          <FieldSet>
            <FieldLegend>بخش‌های سفارشی</FieldLegend>
            {sections.map((section, index) => (
              <Card key={index} size="sm">
                <CardHeader>
                  <CardTitle>بخش {index + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <Field className="max-w-sm">
                      <FieldLabel htmlFor={`section-title-${index}`}>عنوان</FieldLabel>
                      <Input
                        id={`section-title-${index}`}
                        value={section.title}
                        maxLength={120}
                        onChange={(event) => {
                          const next = sections.slice();
                          next[index] = { ...section, title: event.target.value };
                          setSections(next);
                        }}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`section-body-${index}`}>توضیحات</FieldLabel>
                      <Textarea
                        id={`section-body-${index}`}
                        value={section.body}
                        maxLength={4000}
                        rows={4}
                        onChange={(event) => {
                          const next = sections.slice();
                          next[index] = { ...section, body: event.target.value };
                          setSections(next);
                        }}
                      />
                    </Field>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSections(sections.filter((_, item) => item !== index))}
                    >
                      حذف بخش
                    </Button>
                  </FieldGroup>
                </CardContent>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setSections([...sections, { title: "", body: "" }])}
            >
              افزودن بخش
            </Button>
          </FieldSet>

          {state?.ok === false ? <FieldError>{state.error}</FieldError> : null}
          {state?.ok ? (
            <p role="status" className="text-sm text-foreground">
              ذخیره شد.
            </p>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? "در حال ذخیره" : "ذخیره"}
          </Button>
        </FieldGroup>
      </form>

      {service ? (
        <Card size="sm" className="max-w-sm">
          <CardHeader>
            <CardTitle>تصویر</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {service.imageKey ? (
              <Image
                src={`/media/${service.imageKey}`}
                alt={service.title}
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
          {deleteState?.ok === false ? <FieldError>{deleteState.error}</FieldError> : null}
          <Button type="submit" variant="destructive" disabled={deleting} className="w-fit">
            حذف خدمت
          </Button>
        </form>
      ) : null}
    </div>
  );
}
