import { z } from "zod";
import { BOOKING_COPY_MAX_DAYS, timeToMinutes } from "@/lib/booking-windows";
import { DATE_RE, TIME_RE, addCivilDays } from "@/lib/tehran";

const civilDateSchema = z
  .string()
  .trim()
  .regex(DATE_RE, "تاریخ نامعتبر است.");

const clockSchema = z
  .string()
  .trim()
  .transform((value) => value.slice(0, 5))
  .pipe(z.string().regex(TIME_RE, "ساعت نامعتبر است."))
  .refine((value) => timeToMinutes(value) !== null, "ساعت نامعتبر است.");

export const addBookingWindowSchema = z
  .object({
    date: civilDateSchema,
    startTime: clockSchema,
    endTime: clockSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    const start = timeToMinutes(value.startTime);
    const end = timeToMinutes(value.endTime);
    if (start === null || end === null || end <= start) {
      ctx.addIssue({
        code: "custom",
        message: "ساعت پایان باید بعد از ساعت شروع باشد.",
        path: ["endTime"],
      });
    }
  });

export const bookingDayClosedSchema = z
  .object({
    date: civilDateSchema,
    closed: z.boolean(),
  })
  .strict();

export const bookingWindowIdSchema = z
  .object({
    id: z.string().trim().min(1).max(64),
  })
  .strict();

export const copyBookingWindowsSchema = z
  .object({
    sourceDate: civilDateSchema,
    startDate: civilDateSchema,
    endDate: civilDateSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.endDate < value.startDate) {
      ctx.addIssue({
        code: "custom",
        message: "تاریخ پایان نباید قبل از تاریخ شروع باشد.",
        path: ["endDate"],
      });
      return;
    }
    const maxEnd = addCivilDays(value.startDate, BOOKING_COPY_MAX_DAYS - 1);
    if (maxEnd && value.endDate > maxEnd) {
      ctx.addIssue({
        code: "custom",
        message: `بیش از ${BOOKING_COPY_MAX_DAYS} روز را یک‌جا نمی‌توان کپی کرد.`,
        path: ["endDate"],
      });
    }
  });

export const requestFormWithWindowSchema = z
  .object({
    serviceId: z.string().trim().min(1).max(64),
    note: z.string().trim().max(2000, "توضیح طولانی است."),
    bookingWindowId: z.string().trim().min(1, "بازه زمانی را انتخاب کنید.").max(64),
  })
  .strict();

export const exactVisitTimeSchema = z
  .object({
    id: z.string().trim().min(1).max(64),
    time: clockSchema,
  })
  .strict();
