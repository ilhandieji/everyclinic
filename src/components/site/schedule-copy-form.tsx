"use client";

import { useActionState } from "react";
import { copyBookingWindows } from "@/lib/actions/booking-schedule";
import type { ActionState } from "@/lib/actions/state";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ScheduleCopyForm({
  sourceDate,
  defaultEnd,
}: {
  sourceDate: string;
  defaultEnd: string;
}) {
  const [state, action, pending] = useActionState(copyBookingWindows, null as ActionState);

  return (
    <form action={action} className="rounded-lg border border-border/80 bg-muted/20 p-3">
      <input type="hidden" name="sourceDate" value={sourceDate} />
      <input type="hidden" name="startDate" value={sourceDate} />
      <FieldGroup>
        <p className="text-sm text-foreground">همین ساعت‌ها را برای روزهای بعدی هم بگذار</p>
        <p className="text-xs text-muted-foreground">
          از امروز تا تاریخی که می‌نویسید، همین بازه‌ها تکرار می‌شوند. روزهایی که قبلاً رزرو شده‌اند دست
          نمی‌خورند.
        </p>
        <Field>
          <FieldLabel htmlFor={`copy-until-${sourceDate}`}>تا چه تاریخی؟</FieldLabel>
          <Input
            id={`copy-until-${sourceDate}`}
            name="endDate"
            type="date"
            required
            defaultValue={defaultEnd}
            min={sourceDate}
            dir="ltr"
            lang="en"
          />
        </Field>
        {state?.ok === false ? <FieldError>{state.error}</FieldError> : null}
        {state?.ok ? (
          <p role="status" className="text-sm">
            ساعت‌ها روی روزهای انتخاب‌شده گذاشته شد.
          </p>
        ) : null}
        <Button type="submit" size="sm" variant="outline" disabled={pending} className="w-fit">
          تکرار روی این روزها
        </Button>
      </FieldGroup>
    </form>
  );
}
