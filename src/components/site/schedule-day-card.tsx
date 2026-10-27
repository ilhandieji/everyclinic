"use client";

import { useActionState } from "react";
import {
  addBookingWindow,
  removeBookingWindow,
  setBookingDayClosed,
} from "@/lib/actions/booking-schedule";
import type { AdminBookingDay } from "@/lib/booking-availability";
import { addCivilDays } from "@/lib/tehran";
import type { ActionState } from "@/lib/actions/state";
import { ScheduleCopyForm } from "@/components/site/schedule-copy-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ScheduleDayCard({ day }: { day: AdminBookingDay }) {
  const [addState, addAction, adding] = useActionState(addBookingWindow, null as ActionState);
  const [closeState, closeAction, closing] = useActionState(
    setBookingDayClosed,
    null as ActionState,
  );
  const [removeState, removeAction, removing] = useActionState(
    removeBookingWindow,
    null as ActionState,
  );
  const copyUntil = addCivilDays(day.date, 6) ?? day.date;

  return (
    <Card className={cn(day.closed && "opacity-80")}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle>{day.dateLabel}</CardTitle>
          <p dir="ltr" lang="en" className="text-xs text-muted-foreground">
            {day.date}
          </p>
        </div>
        <form action={closeAction}>
          <input type="hidden" name="date" value={day.date} />
          <input type="hidden" name="closed" value={day.closed ? "false" : "true"} />
          <Button type="submit" size="sm" variant="outline" disabled={closing}>
            {day.closed ? "باز کردن رزرو" : "بستن رزرو این روز"}
          </Button>
        </form>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {day.closed ? (
          <p className="text-sm text-muted-foreground">بیمار نمی‌تواند برای این روز وقت بگیرد.</p>
        ) : null}
        {closeState?.ok === false ? <FieldError>{closeState.error}</FieldError> : null}
        {day.windows.length === 0 ? (
          <p className="text-sm text-muted-foreground">هنوز ساعتی برای این روز نگذاشته‌اید.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {day.windows.map((window) => (
              <li
                key={window.id}
                className="flex flex-wrap items-center justify-start gap-2 rounded-lg border border-border px-3 py-2"
              >
                <span dir="ltr" lang="en" className="text-sm font-medium text-foreground">
                  {window.startTime} – {window.endTime}
                </span>
                {window.reserved ? (
                  <span className="text-xs text-muted-foreground">رزرو شده</span>
                ) : (
                  <form action={removeAction}>
                    <input type="hidden" name="id" value={window.id} />
                    <Button type="submit" size="xs" variant="ghost" disabled={removing}>
                      حذف
                    </Button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
        {removeState?.ok === false ? <FieldError>{removeState.error}</FieldError> : null}
        <form action={addAction}>
          <input type="hidden" name="date" value={day.date} />
          <FieldGroup>
            <p className="text-sm font-medium text-foreground">ساعت پذیرش در این روز</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor={`start-${day.date}`}>شروع</FieldLabel>
                <Input
                  id={`start-${day.date}`}
                  name="startTime"
                  type="time"
                  required
                  defaultValue="07:00"
                  dir="ltr"
                  lang="en"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`end-${day.date}`}>پایان</FieldLabel>
                <Input
                  id={`end-${day.date}`}
                  name="endTime"
                  type="time"
                  required
                  defaultValue="14:00"
                  dir="ltr"
                  lang="en"
                />
              </Field>
            </div>
            {addState?.ok === false ? <FieldError>{addState.error}</FieldError> : null}
            {addState?.ok ? (
              <p role="status" className="text-sm">
                بازه اضافه شد.
              </p>
            ) : null}
            <Button type="submit" size="sm" disabled={adding} className="w-fit">
              افزودن بازه
            </Button>
          </FieldGroup>
        </form>
        {day.windows.length > 0 ? (
          <ScheduleCopyForm sourceDate={day.date} defaultEnd={copyUntil} />
        ) : null}
      </CardContent>
    </Card>
  );
}
