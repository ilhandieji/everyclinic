"use client";

import type { PublicBookingDay } from "@/lib/booking-availability";
import { Field, FieldLabel } from "@/components/ui/field";

export function BookingWindowPicker({ days }: { days: PublicBookingDay[] }) {
  if (days.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">فعلاً زمان باز برای رزرو نیست.</p>
    );
  }

  return (
    <Field>
      <FieldLabel>روز و بازهٔ زمانی</FieldLabel>
      <ul className="flex max-h-72 flex-col gap-3 overflow-y-auto">
        {days.map((day) => (
          <li key={day.date} className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">{day.dateLabel}</p>
            <div className="flex flex-col gap-1.5">
              {day.windows.map((window) => (
                <label
                  key={window.id}
                  className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border border-border bg-field px-2.5 py-1.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-accent"
               >
                  <input
                    type="radio"
                    name="bookingWindowId"
                    value={window.id}
                    required
                    className="size-4 shrink-0 accent-primary"
                  />
                  <span dir="ltr" lang="en">
                    {window.label}
                  </span>
                </label>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </Field>
  );
}
