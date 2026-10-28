"use client";

import { useState } from "react";

const HOURS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, "0"));

const clockSelectClass =
  "h-9 min-w-0 flex-1 rounded-lg border border-input bg-field px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60";

function splitClock(value: string): [string, string] {
  const [hour = "07", minute = "00"] = value.split(":");
  return [hour.padStart(2, "0"), minute.padStart(2, "0")];
}

function ClockControl({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [hour, minute] = splitClock(value);

  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-sm font-medium text-foreground">{label}</legend>
      <div className="flex items-center gap-2" dir="ltr" lang="en">
        <select
          id={`${id}-hour`}
          className={clockSelectClass}
          aria-label={`ساعت ${label}`}
          value={hour}
          onChange={(event) => onChange(`${event.target.value}:${minute}`)}
        >
          {HOURS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <span aria-hidden className="text-muted-foreground">
          :
        </span>
        <select
          id={`${id}-minute`}
          className={clockSelectClass}
          aria-label={`دقیقه ${label}`}
          value={minute}
          onChange={(event) => onChange(`${hour}:${event.target.value}`)}
        >
          {MINUTES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}

export function TimeRangeFields({
  idPrefix,
  startName = "startTime",
  endName = "endTime",
  defaultStart = "07:00",
  defaultEnd = "14:00",
}: {
  idPrefix: string;
  startName?: string;
  endName?: string;
  defaultStart?: string;
  defaultEnd?: string;
}) {
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name={startName} value={start} />
      <input type="hidden" name={endName} value={end} />
      <ClockControl id={`${idPrefix}-start`} label="شروع" value={start} onChange={setStart} />
      <ClockControl id={`${idPrefix}-end`} label="پایان" value={end} onChange={setEnd} />
    </div>
  );
}
