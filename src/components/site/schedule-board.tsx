"use client";

import { useEffect, useRef, useState } from "react";
import { ScheduleDayEditor, type ScheduleDayView } from "@/components/site/schedule-day-card";
import { cn } from "@/lib/utils";
import { saturdayWeekIndex } from "@/lib/tehran";

const WEEKDAY_HEADERS = [
  { narrow: "ش", short: "شنبه", long: "شنبه" },
  { narrow: "ی", short: "یکشنبه", long: "یکشنبه" },
  { narrow: "د", short: "دوشنبه", long: "دوشنبه" },
  { narrow: "س", short: "سه‌شنبه", long: "سه‌شنبه" },
  { narrow: "چ", short: "چهارشنبه", long: "چهارشنبه" },
  { narrow: "پ", short: "پنجشنبه", long: "پنجشنبه" },
  { narrow: "ج", short: "جمعه", long: "جمعه" },
] as const;

function buildWeeks(days: ScheduleDayView[]): (ScheduleDayView | null)[][] {
  const leading = saturdayWeekIndex(days[0]?.date ?? "") ?? 0;
  const cells: (ScheduleDayView | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...days,
  ];
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  const weeks: (ScheduleDayView | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }
  return weeks;
}

function dayStatusLabel(day: ScheduleDayView): string {
  if (day.closed) {
    return "بسته";
  }
  if (day.windows.length === 0) {
    return "خالی";
  }
  if (day.windows.some((window) => window.reserved)) {
    return "رزرو";
  }
  return `${day.openWindowCountLabel} بازه`;
}

function dayAriaLabel(day: ScheduleDayView, today: string): string {
  const parts = [day.weekdayLong, day.dateLabel, dayStatusLabel(day)];
  if (day.date === today) {
    parts.push("امروز");
  }
  return parts.join("، ");
}

export function ScheduleBoard({
  days,
  today,
}: {
  days: ScheduleDayView[];
  today: string;
}) {
  const [selectedDate, setSelectedDate] = useState(
    () => days.find((day) => day.date === today)?.date ?? days[0]?.date ?? "",
  );
  const pendingFocus = useRef<string | null>(null);
  const selected = days.find((day) => day.date === selectedDate) ?? days[0];
  const weeks = buildWeeks(days);
  const leading = saturdayWeekIndex(days[0]?.date ?? "") ?? 0;

  useEffect(() => {
    const date = pendingFocus.current;
    if (!date) {
      return;
    }
    pendingFocus.current = null;
    const node = document.getElementById(`schedule-day-${date}`);
    if (node instanceof HTMLElement) {
      node.focus({ preventScroll: false, focusVisible: true });
    }
  }, [selectedDate]);

  function moveSelection(current: string, key: string) {
    const index = days.findIndex((day) => day.date === current);
    if (index < 0) {
      return;
    }
    const cell = index + leading;
    const rowStart = Math.floor(cell / 7) * 7;
    const rowEnd = rowStart + 6;
    let nextIndex = index;
    if (key === "ArrowLeft") {
      nextIndex = index + 1;
    } else if (key === "ArrowRight") {
      nextIndex = index - 1;
    } else if (key === "ArrowDown") {
      nextIndex = index + 7;
    } else if (key === "ArrowUp") {
      nextIndex = index - 7;
    } else if (key === "Home") {
      nextIndex = Math.max(0, rowStart - leading);
    } else if (key === "End") {
      nextIndex = Math.min(days.length - 1, rowEnd - leading);
    } else {
      return;
    }
    if (nextIndex < 0 || nextIndex >= days.length) {
      return;
    }
    const next = days[nextIndex];
    if (!next || next.date === current) {
      return;
    }
    pendingFocus.current = next.date;
    setSelectedDate(next.date);
  }

  if (!selected) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-8">
      <section aria-label="روزهای پذیرش" className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {days[0]?.dateLabel} تا {days[days.length - 1]?.dateLabel}
        </p>
        <div role="grid" aria-label="هفته‌ها از شنبه" className="flex flex-col gap-1">
          <div role="row" className="grid grid-cols-7 gap-1">
            {WEEKDAY_HEADERS.map((header) => (
              <div
                key={header.long}
                role="columnheader"
                className="px-0.5 text-center text-xs text-muted-foreground"
              >
                <span className="sm:hidden" aria-hidden>
                  {header.narrow}
                </span>
                <span className="hidden sm:inline">{header.short}</span>
                <span className="sr-only sm:hidden">{header.long}</span>
              </div>
            ))}
          </div>
          {weeks.map((week, weekIndex) => (
            <div role="row" key={week[0]?.date ?? `empty-${weekIndex}`} className="grid grid-cols-7 gap-1">
              {week.map((day, dayIndex) => (
                <div
                  role="gridcell"
                  key={day?.date ?? `pad-${weekIndex}-${dayIndex}`}
                  aria-selected={day ? selected.date === day.date : undefined}
                >
                  {day ? (
                    <button
                      type="button"
                      id={`schedule-day-${day.date}`}
                      className={cn(
                        "focus-ring flex min-h-14 w-full scroll-mt-20 flex-col items-center justify-center gap-0.5 rounded-lg border px-0.5 py-1 text-center",
                        selected.date === day.date &&
                          "border-primary bg-accent outline-2 outline-offset-2 outline-ring",
                        selected.date !== day.date &&
                          day.closed &&
                          "border-border bg-muted text-muted-foreground",
                        selected.date !== day.date &&
                          !day.closed &&
                          day.windows.length === 0 &&
                          "border-dashed border-border bg-card",
                        selected.date !== day.date &&
                          !day.closed &&
                          day.windows.length > 0 &&
                          "border-border bg-card",
                      )}
                      aria-current={day.date === today ? "date" : undefined}
                      aria-label={dayAriaLabel(day, today)}
                      tabIndex={selected.date === day.date ? 0 : -1}
                      onClick={() => setSelectedDate(day.date)}
                      onKeyDown={(event) => {
                        if (
                          event.key === "ArrowLeft" ||
                          event.key === "ArrowRight" ||
                          event.key === "ArrowUp" ||
                          event.key === "ArrowDown" ||
                          event.key === "Home" ||
                          event.key === "End"
                        ) {
                          event.preventDefault();
                          moveSelection(day.date, event.key);
                        }
                      }}
                    >
                      {days[0]?.date === day.date ||
                      days[days.findIndex((item) => item.date === day.date) - 1]?.monthShort !==
                        day.monthShort ? (
                        <span className="text-[0.65rem] leading-none text-muted-foreground">
                          {day.monthShort}
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          day.date === today && "underline decoration-primary decoration-2 underline-offset-4",
                        )}
                      >
                        {day.dayNumber}
                      </span>
                      <span className="text-[0.65rem] leading-tight text-muted-foreground">
                        {dayStatusLabel(day)}
                      </span>
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
      <ScheduleDayEditor key={selected.date} day={selected} today={today} />
    </div>
  );
}
