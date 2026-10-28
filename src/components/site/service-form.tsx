"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/lib/actions/state";
import { DeleteServiceButton } from "@/components/site/delete-service-button";
import { ServiceImageField } from "@/components/site/service-image-field";
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
  const [state, formAction, pending] = useActionState(action, null as ActionState);
  const [sections, setSections] = useState<SectionDraft[]>(service?.sections ?? []);
  const [currency, setCurrency] = useState(knownCurrency(service?.currencyLabel));
  const [published, setPublished] = useState(service?.published ?? false);

  return (
    <div className="flex w-full flex-col gap-8">
      <form action={formAction}>
        {service ? <input type="hidden" name="id" value={service.id} /> : null}
        <input type="hidden" name="sections" value={JSON.stringify(sections)} />
        <input type="hidden" name="currencyLabel" value={currency} />
        <input type="hidden" name="published" value={published ? "on" : ""} />
        <FieldGroup>
          <Field>
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
              className="min-h-32"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field className="min-w-0">
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
            <Field className="min-w-0">
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
            <Field className="min-w-0">
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
            <Field className="min-w-0">
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
          </div>
          <FieldSet>
            <FieldLegend>بخش‌های سفارشی</FieldLegend>
            {sections.map((section, index) => (
              <Card key={index} size="sm">
                <CardHeader>
                  <CardTitle>بخش {index + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <Field>
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
                        rows={5}
                        className="min-h-32"
                        onChange={(event) => {
                          const next = sections.slice();
                          next[index] = { ...section, body: event.target.value };
                          setSections(next);
                        }}
                      />
                    </Field>
                    <Button
                      type="button"
                      variant="destructive"
                      className="h-11 w-fit"
                      onClick={() => setSections(sections.filter((_, item) => item !== index))}
                    >
                      حذف بخش
                    </Button>
                  </FieldGroup>
                </CardContent>
              </Card>
            ))}
          </FieldSet>

          {state?.ok === false ? <FieldError>{state.error}</FieldError> : null}
          {state?.ok ? (
            <p role="status" className="text-sm text-foreground">
              ذخیره شد.
            </p>
          ) : null}
          <div className="flex w-full flex-wrap items-center gap-3">
            <Field orientation="horizontal" className="w-fit shrink-0">
              <Checkbox
                id="published"
                checked={published}
                onCheckedChange={(checked) => setPublished(checked === true)}
              />
              <FieldLabel htmlFor="published">نمایش در صفحه خدمات</FieldLabel>
            </Field>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-fit shrink-0"
              onClick={() => setSections([...sections, { title: "", body: "" }])}
            >
              افزودن بخش
            </Button>
          </div>
          <Button type="submit" className="h-11 w-fit" disabled={pending}>
            {pending ? "در حال ذخیره" : "ذخیره"}
          </Button>
        </FieldGroup>
      </form>

      {service ? (
        <ServiceImageField
          serviceId={service.id}
          title={service.title}
          imageKey={service.imageKey}
        />
      ) : null}

      {service ? <DeleteServiceButton id={service.id} /> : null}
    </div>
  );
}
