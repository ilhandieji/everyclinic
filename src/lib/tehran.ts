export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_RE = /^\d{2}:\d{2}$/;

/** Iran standard offset since 2022 (no DST). Used only for reminder civil times. */
const TEHRAN_OFFSET = "+03:30";

export function parseTehranDateTime(date: string, time: string): Date | null {
  if (!DATE_RE.test(date) || !TIME_RE.test(time)) {
    return null;
  }
  const parsed = new Date(`${date}T${time}:00${TEHRAN_OFFSET}`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

export function formatFaDate(date: Date): string {
  return date.toLocaleDateString("fa-IR", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatFaDateTime(date: Date): string {
  return date.toLocaleString("fa-IR", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function tehranCivilDate(now = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: "Asia/Tehran" });
}

export function tehranCivilTime(now = new Date()): string {
  return now.toLocaleTimeString("en-GB", {
    timeZone: "Asia/Tehran",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function utcDateToCivil(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function civilToUtcDate(civil: string): Date | null {
  if (!DATE_RE.test(civil)) {
    return null;
  }
  const parsed = new Date(`${civil}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || utcDateToCivil(parsed) !== civil) {
    return null;
  }
  return parsed;
}

export function addCivilDays(civil: string, days: number): string | null {
  const start = civilToUtcDate(civil);
  if (!start) {
    return null;
  }
  start.setUTCDate(start.getUTCDate() + days);
  return utcDateToCivil(start);
}

export function formatFaClock(hhmm: string): string {
  const parsed = parseTehranDateTime("2026-01-01", hhmm);
  if (!parsed) {
    return hhmm;
  }
  return parsed.toLocaleTimeString("fa-IR", {
    timeZone: "Asia/Tehran",
    hour: "2-digit",
    minute: "2-digit",
  });
}
