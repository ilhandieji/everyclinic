import { z } from "zod";
import { parseTehranDateTime } from "@/lib/tehran";

const nonEmpty = (message: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, message)
    .max(max, "متن طولانی است.");

export const reminderFormSchema = z
  .object({
    patientProfileId: z.string().min(1, "بیمار نامعتبر است."),
    title: nonEmpty("عنوان یادآوری را بنویسید.", 120),
    message: nonEmpty("پیام یادآوری را بنویسید.", 2000),
    dueDate: z.string().trim(),
    dueTime: z.string().trim(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (!parseTehranDateTime(value.dueDate, value.dueTime)) {
      ctx.addIssue({
        code: "custom",
        message: "تاریخ و ساعت موعد را درست وارد کنید.",
        path: ["dueTime"],
      });
    }
  });

export const reminderStatusSchema = z.enum(["completed", "cancelled"], {
  error: "وضعیت نامعتبر است.",
});

export const prescriptionFormSchema = z
  .object({
    patientProfileId: z.string().min(1, "بیمار نامعتبر است."),
    medicationName: nonEmpty("نام دارو را بنویسید.", 120),
    dosage: nonEmpty("دوز را بنویسید.", 120),
    frequency: nonEmpty("نحوهٔ مصرف را بنویسید.", 240),
    notes: z.string().trim().max(2000, "یادداشت طولانی است."),
    startDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "تاریخ شروع نامعتبر است."),
    renewsId: z.string().trim().optional(),
  })
  .strict();

export const medicationStatusFormSchema = z
  .object({
    prescriptionId: z.string().min(1, "دارو نامعتبر است."),
    status: z.enum(["completed", "discontinued"], {
      error: "وضعیت نامعتبر است.",
    }),
    endDate: z.string().trim(),
    note: z.string().trim().max(2000, "یادداشت طولانی است."),
  })
  .strict();
