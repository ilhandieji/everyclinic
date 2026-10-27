import { z } from "zod";

const letterRegex = /\p{L}/u;
const digitRegex = /\p{N}/u;
const symbolRegex = /[^\p{L}\p{N}]/u;

export const passwordSchema = z
  .string()
  .min(8, "رمز عبور باید حداقل ۸ نویسه باشد.")
  .max(128, "رمز عبور نباید بیش از ۱۲۸ نویسه باشد.")
  .refine((v) => letterRegex.test(v), {
    message: "رمز عبور باید حداقل یک حرف داشته باشد.",
  })
  .refine((v) => digitRegex.test(v), {
    message: "رمز عبور باید حداقل یک عدد داشته باشد.",
  })
  .refine((v) => symbolRegex.test(v), {
    message: "رمز عبور باید حداقل یک نماد داشته باشد.",
  });

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: "ایمیل معتبر وارد کنید." }));

export const fullNameSchema = z
  .string()
  .trim()
  .min(1, "نام و نام خانوادگی کامل را وارد کنید.")
  .max(120, "نام و نام خانوادگی نباید بیش از ۱۲۰ نویسه باشد.");

export const registerBodySchema = z
  .strictObject({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "تکرار رمز عبور با رمز عبور یکسان نیست.",
    path: ["confirmPassword"],
  });

export const loginBodySchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "رمز عبور را وارد کنید."),
  rememberMe: z.boolean().optional(),
});

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function safeCallbackUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") {
    return "/";
  }
  if (!url.startsWith("/") || url.startsWith("//") || url.includes("\\")) {
    return "/";
  }
  let decoded = url;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    return "/";
  }
  if (
    !decoded.startsWith("/") ||
    /^\/{2,}/.test(decoded) ||
    decoded.includes("\\") ||
    decoded.includes("://")
  ) {
    return "/";
  }
  return url;
}
