import { BOOKING_HORIZON_DAYS, bookingWindowBookable, civilRange } from "@/lib/booking-windows";
import prisma from "@/lib/prisma";
import {
  addCivilDays,
  civilToUtcDate,
  formatFaClock,
  formatFaDate,
  parseTehranDateTime,
  tehranCivilDate,
  utcDateToCivil,
} from "@/lib/tehran";

export type PublicBookingWindow = {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
};

export type PublicBookingDay = {
  date: string;
  dateLabel: string;
  windows: PublicBookingWindow[];
};

export type AdminBookingWindow = PublicBookingWindow & {
  reserved: boolean;
};

export type AdminBookingDay = {
  date: string;
  dateLabel: string;
  closed: boolean;
  windows: AdminBookingWindow[];
};

function windowLabel(startTime: string, endTime: string): string {
  return `${formatFaClock(startTime)} تا ${formatFaClock(endTime)}`;
}

function windowHasEnded(date: string, endTime: string, now: Date): boolean {
  const end = parseTehranDateTime(date, endTime);
  if (!end) {
    return true;
  }
  return end.getTime() <= now.getTime();
}

export function defaultHorizonRange(now = new Date()): { start: string; end: string } {
  const start = tehranCivilDate(now);
  const end = addCivilDays(start, BOOKING_HORIZON_DAYS - 1) ?? start;
  return { start, end };
}

export async function loadOpenAvailability(
  now = new Date(),
): Promise<PublicBookingDay[]> {
  const { start, end } = defaultHorizonRange(now);
  const startDate = civilToUtcDate(start);
  const endDate = civilToUtcDate(end);
  if (!startDate || !endDate) {
    return [];
  }

  const days = await prisma.bookingDay.findMany({
    where: {
      closed: false,
      physician: { singleton: 1 },
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "asc" },
    select: {
      date: true,
      windows: {
        orderBy: { startTime: "asc" },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          request: { select: { id: true } },
        },
      },
    },
  });

  return days
    .map((day) => {
      const date = utcDateToCivil(day.date);
      const windows = day.windows
        .filter((window) => {
          const gate = bookingWindowBookable({
            closed: false,
            taken: window.request !== null,
            windowEnded: windowHasEnded(date, window.endTime, now),
          });
          return gate.ok;
        })
        .map((window) => ({
          id: window.id,
          startTime: window.startTime,
          endTime: window.endTime,
          label: windowLabel(window.startTime, window.endTime),
        }));
      return {
        date,
        dateLabel: formatFaDate(parseTehranDateTime(date, "00:00") ?? day.date),
        windows,
      };
    })
    .filter((day) => day.windows.length > 0);
}

export async function loadAdminSchedule(
  physicianProfileId: string,
  now = new Date(),
): Promise<AdminBookingDay[]> {
  const { start, end } = defaultHorizonRange(now);
  const startDate = civilToUtcDate(start);
  const endDate = civilToUtcDate(end);
  if (!startDate || !endDate) {
    return [];
  }

  const rows = await prisma.bookingDay.findMany({
    where: {
      physicianProfileId,
      date: { gte: startDate, lte: endDate },
    },
    select: {
      date: true,
      closed: true,
      windows: {
        orderBy: { startTime: "asc" },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          request: { select: { id: true } },
        },
      },
    },
  });

  const byDate = new Map(rows.map((row) => [utcDateToCivil(row.date), row]));
  return civilRange(start, end).map((date) => {
    const row = byDate.get(date);
    const instant = parseTehranDateTime(date, "00:00");
    return {
      date,
      dateLabel: formatFaDate(instant ?? new Date(`${date}T00:00:00.000Z`)),
      closed: row?.closed ?? false,
      windows:
        row?.windows.map((window) => ({
          id: window.id,
          startTime: window.startTime,
          endTime: window.endTime,
          label: windowLabel(window.startTime, window.endTime),
          reserved: window.request !== null,
        })) ?? [],
    };
  });
}
