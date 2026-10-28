"use client";

import { useActionState, useState } from "react";
import { copyBookingWindows } from "@/lib/actions/booking-schedule";
import type { ActionState } from "@/lib/actions/state";
import { HelpDisclosure } from "@/components/layout/help-disclosure";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatFaDate, parseTehranDateTime } from "@/lib/tehran";

export function ScheduleCopyForm({
  sourceDate,
  defaultEnd,
  initialPreview,
}: {
  sourceDate: string;
  defaultEnd: string;
  initialPreview: string;
}) {
  const [state, action, pending] = useActionState(copyBookingWindows, null as ActionState);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [preview, setPreview] = useState(initialPreview);

  return (
    <HelpDisclosure summary="تکرار روی روزهای بعدی">
      <form action={action}>
        <input type="hidden" name="sourceDate" value={sourceDate} />
        <input type="hidden" name="startDate" value={sourceDate} />
        <FieldGroup>
          <p className="text-sm text-muted-foreground">
            همین بازه‌ها تا این تاریخ تکرار می‌شوند. روزی که رزرو دارد عوض نمی‌شود.
          </p>
          <Field>
            <FieldLabel htmlFor={`copy-until-${sourceDate}`}>تا چه تاریخی؟</FieldLabel>
            {preview ? (
              <p id={`copy-until-preview-${sourceDate}`} className="text-base font-semibold text-foreground">
                {preview}
              </p>
            ) : null}
            <Input
              id={`copy-until-${sourceDate}`}
              name="endDate"
              type="date"
              required
              value={endDate}
              min={sourceDate}
              dir="ltr"
              lang="en"
              aria-describedby={preview ? `copy-until-preview-${sourceDate}` : undefined}
              onChange={(event) => {
                const value = event.target.value;
                setEndDate(value);
                const instant = parseTehranDateTime(value, "12:00");
                setPreview(instant ? formatFaDate(instant) : "");
              }}
            />
          </Field>
          {state?.ok === false ? <FieldError>{state.error}</FieldError> : null}
          {state?.ok ? (
            <p role="status" className="text-sm text-foreground">
              ساعت‌ها روی روزهای انتخاب‌شده گذاشته شد.
            </p>
          ) : null}
          <Button type="submit" size="sm" variant="outline" disabled={pending} className="w-fit">
            تکرار روی این روزها
          </Button>
        </FieldGroup>
      </form>
    </HelpDisclosure>
  );
}
