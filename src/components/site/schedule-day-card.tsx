"use client";

import { useActionState } from "react";
import {
  addBookingWindow,
  removeBookingWindow,
  setBookingDayClosed,
} from "@/lib/actions/booking-schedule";
import type { AdminBookingDay } from "@/lib/booking-availability";
import type { ActionState } from "@/lib/actions/state";

export type ScheduleDayView = AdminBookingDay & {
  dayNumber: string;
  monthShort: string;
  weekdayLong: string;
  openWindowCountLabel: string;
  copyUntil: string;
  copyPreview: string;
};
import { EmptyState } from "@/components/layout/empty-state";
import { ScheduleCopyForm } from "@/components/site/schedule-copy-form";
import { TimeRangeFields } from "@/components/site/time-range-fields";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";

export function ScheduleDayEditor({
  day,
  today,
}: {
  day: ScheduleDayView;
  today: string;
}) {
  const [addState, addAction, adding] = useActionState(addBookingWindow, null as ActionState);
  const [closeState, closeAction, closing] = useActionState(
    setBookingDayClosed,
    null as ActionState,
  );
  const [removeState, removeAction, removing] = useActionState(
    removeBookingWindow,
    null as ActionState,
  );
  const heading =
    day.date === today
      ? `امروز، ${day.weekdayLong} ${day.dateLabel}`
      : `${day.weekdayLong} ${day.dateLabel}`;

  return (
    <section
      aria-labelledby="schedule-day-heading"
      className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 id="schedule-day-heading" className="text-base font-semibold text-foreground">
          {heading}
        </h2>
        <form action={closeAction}>
          <input type="hidden" name="date" value={day.date} />
          <input type="hidden" name="closed" value={day.closed ? "false" : "true"} />
          <Button type="submit" size="sm" variant="outline" disabled={closing}>
            {day.closed ? "باز کردن رزرو" : "بستن رزرو این روز"}
          </Button>
        </form>
      </div>
      {day.closed ? (
        <p className="text-sm text-muted-foreground">بیمار نمی‌تواند برای این روز وقت بگیرد.</p>
      ) : null}
      {closeState?.ok === false ? <FieldError>{closeState.error}</FieldError> : null}
      {day.windows.length === 0 ? (
        <EmptyState>هنوز ساعتی برای این روز نگذاشته‌اید.</EmptyState>
      ) : (
        <ul className="flex flex-col gap-2">
          {day.windows.map((window) => (
            <li
              key={window.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
            >
              <span className="text-sm font-medium text-foreground">{window.label}</span>
              {window.reserved ? (
                <span className="rounded-md bg-[var(--status-reserved)] px-1.5 py-0.5 text-xs text-[var(--status-reserved-foreground)]">
                  رزرو شده
                </span>
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
          <TimeRangeFields idPrefix={day.date} />
          {addState?.ok === false ? <FieldError>{addState.error}</FieldError> : null}
          {addState?.ok ? (
            <p role="status" className="text-sm text-foreground">
              بازه اضافه شد.
            </p>
          ) : null}
          <Button type="submit" size="sm" disabled={adding} className="w-fit">
            افزودن بازه
          </Button>
        </FieldGroup>
      </form>
      {day.windows.length > 0 ? (
        <ScheduleCopyForm
          sourceDate={day.date}
          defaultEnd={day.copyUntil}
          initialPreview={day.copyPreview}
        />
      ) : null}
    </section>
  );
}
