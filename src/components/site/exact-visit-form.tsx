"use client";

import { useActionState } from "react";
import { setExactVisitTime } from "@/lib/actions/requests";
import type { ActionState } from "@/lib/actions/state";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ExactVisitForm({
  id,
  windowLabel,
}: {
  id: string;
  windowLabel: string;
}) {
  const [state, action, pending] = useActionState(setExactVisitTime, null as ActionState);

  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <FieldGroup>
        <p className="text-sm text-muted-foreground">
          ساعت دقیق ویزیت را داخل بازهٔ
          {" "}
          <span dir="ltr" lang="en">{windowLabel}</span>
          {" "}
          بگذارید. بیمار در صندوق اعلان‌ها مطلع می‌شود.
        </p>
        <Field>
          <FieldLabel htmlFor={`exact-${id}`}>ساعت ویزیت</FieldLabel>
          <Input
            id={`exact-${id}`}
            name="time"
            type="time"
            required
            dir="ltr"
            lang="en"
          />
        </Field>
        {state?.ok === false ? <FieldError>{state.error}</FieldError> : null}
        {state?.ok ? (
          <p role="status" className="text-sm">
            ساعت ویزیت ثبت شد.
          </p>
        ) : null}
        <Button type="submit" size="sm" disabled={pending} className="w-fit">
          ثبت ساعت ویزیت
        </Button>
      </FieldGroup>
    </form>
  );
}
