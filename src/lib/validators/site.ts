import { z } from "zod";

const PRICE_MAX = 1_000_000_000_000;

const optionalPrice = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .pipe(
    z.union([
      z.null(),
      z
        .string()
        .regex(/^\d+$/, "قیمت باید عدد صحیح باشد.")
        .transform((value) => Number(value))
        .refine((value) => value <= PRICE_MAX, "قیمت بیش از حد بزرگ است."),
    ]),
  );

export const currencyLabels = ["تومان", "ریال", "دلار"] as const;

const currencyLabelSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .pipe(
    z.union([
      z.null(),
      z.enum(currencyLabels, { error: "واحد پول را انتخاب کنید." }),
    ]),
  );

export const profileFormSchema = z
  .object({
    displayName: z.string().trim().max(80, "نام طولانی است."),
    gender: z.enum(["مرد", "زن"], { error: "جنسیت را انتخاب کنید." }),
    bio: z.string().trim().max(4000, "معرفی طولانی است."),
  })
  .strict();

const sectionSchema = z
  .object({
    title: z.string().trim().min(1, "عنوان بخش را بنویسید.").max(120),
    body: z.string().trim().min(1, "متن بخش را بنویسید.").max(4000),
  })
  .strict();

export const serviceFormSchema = z
  .object({
    title: z.string().trim().min(1, "نام خدمت را بنویسید.").max(120),
    description: z.string().trim().max(8000, "توضیح طولانی است."),
    priceMin: optionalPrice,
    priceMax: optionalPrice,
    currencyLabel: currencyLabelSchema,
    published: z.boolean(),
    sortOrder: z.coerce.number().int().min(0).max(10000),
    sections: z.array(sectionSchema).max(20, "تعداد بخش‌ها زیاد است."),
  })
  .strict()
  .superRefine((value, ctx) => {
    const hasMin = value.priceMin !== null;
    const hasMax = value.priceMax !== null;
    if (hasMin !== hasMax) {
      ctx.addIssue({
        code: "custom",
        message: "حداقل و حداکثر قیمت را با هم بنویسید، یا هر دو را خالی بگذارید.",
        path: ["priceMax"],
      });
    }
    if (
      value.priceMin !== null &&
      value.priceMax !== null &&
      value.priceMax < value.priceMin
    ) {
      ctx.addIssue({
        code: "custom",
        message: "حداکثر قیمت نباید از حداقل کمتر باشد.",
        path: ["priceMax"],
      });
    }
    if ((hasMin || hasMax) && value.currencyLabel === null) {
      ctx.addIssue({
        code: "custom",
        message: "وقتی قیمت وارد می‌شود، واحد پول را انتخاب کنید.",
        path: ["currencyLabel"],
      });
    }
    if (value.published && value.description.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "برای نمایش عمومی، توضیح لازم است.",
        path: ["description"],
      });
    }
  });

export const requestFormSchema = z
  .object({
    serviceId: z.string().trim().min(1).max(64),
    note: z.string().trim().max(2000, "توضیح طولانی است."),
  })
  .strict();

export const idSchema = z.object({ id: z.string().trim().min(1).max(64) }).strict();

export function emptyToNull(value: string): string | null {
  return value.length === 0 ? null : value;
}
