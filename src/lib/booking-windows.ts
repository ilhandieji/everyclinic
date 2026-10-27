import { TIME_RE, addCivilDays } from "@/lib/tehran";

export const BOOKING_HORIZON_DAYS = 28;
export const BOOKING_COPY_MAX_DAYS = 60;

export function timeToMinutes(hhmm: string): number | null {
  if (!TIME_RE.test(hhmm)) {
    return null;
  }
  const hours = Number(hhmm.slice(0, 2));
  const minutes = Number(hhmm.slice(3, 5));
  if (hours > 23 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
}

export function windowsOverlap(
  a: { startTime: string; endTime: string },
  b: { startTime: string; endTime: string },
): boolean {
  const aStart = timeToMinutes(a.startTime);
  const aEnd = timeToMinutes(a.endTime);
  const bStart = timeToMinutes(b.startTime);
  const bEnd = timeToMinutes(b.endTime);
  if (aStart === null || aEnd === null || bStart === null || bEnd === null) {
    return false;
  }
  return aStart < bEnd && bStart < aEnd;
}

export function windowContainsTime(
  window: { startTime: string; endTime: string },
  time: string,
): boolean {
  const start = timeToMinutes(window.startTime);
  const end = timeToMinutes(window.endTime);
  const point = timeToMinutes(time);
  if (start === null || end === null || point === null) {
    return false;
  }
  return point >= start && point < end;
}

export function bookingWindowBookable(input: {
  closed: boolean;
  taken: boolean;
  windowEnded: boolean;
}): { ok: true } | { ok: false; error: string } {
  if (input.closed) {
    return { ok: false, error: "رزرو این روز بسته است." };
  }
  if (input.taken) {
    return { ok: false, error: "این بازه زمانی گرفته شده است." };
  }
  if (input.windowEnded) {
    return { ok: false, error: "این بازه زمانی گذشته است." };
  }
  return { ok: true };
}

export function civilRange(start: string, end: string): string[] {
  const days: string[] = [];
  let cursor: string | null = start;
  while (cursor && cursor <= end) {
    days.push(cursor);
    cursor = addCivilDays(cursor, 1);
  }
  return days;
}
