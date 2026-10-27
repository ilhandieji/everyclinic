const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

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
