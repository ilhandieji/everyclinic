"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeClosed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { safeCallbackUrl } from "@/lib/validators/auth";

export type AuthCardMode = "login" | "register";

export function AuthCard({
  mode,
  onModeChange,
  onSuccess,
}: {
  mode: AuthCardMode;
  onModeChange?: (mode: AuthCardMode) => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = mode === "login";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!isLogin && fullName.trim().length === 0) {
      setError("نام و نام خانوادگی کامل را وارد کنید.");
      return;
    }
    setIsLoading(true);

    try {
      if (!isLogin) {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email,
            password,
            confirmPassword,
          }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "ثبت‌نام انجام نشد.");
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        rememberMe: isLogin ? String(rememberMe) : "false",
        redirect: false,
      });

      if (result?.error) {
        setError("ایمیل یا رمز عبور نادرست است.");
        return;
      }

      if (onSuccess) {
        onSuccess();
        router.refresh();
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("خطایی رخ داد. دوباره تلاش کنید.");
    } finally {
      setIsLoading(false);
    }
  };

  const title = isLogin ? "خوش آمدید" : "ثبت‌نام";
  const subtitle = isLogin
    ? "برای ادامه وارد حساب خود شوید"
    : "حساب بیمار ساخته می‌شود";
  const submitLabel = isLogin ? "ورود" : "ثبت‌نام";
  const alternateHref = isLogin ? "/register" : "/login";
  const alternatePrompt = isLogin ? "حساب کاربری ندارید؟" : "قبلاً ثبت‌نام کرده‌اید؟";
  const alternateAction = isLogin ? "ثبت‌نام" : "ورود";

  return (
    <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div className="mb-5 flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <form method="post" onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          {error ? (
            <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {!isLogin ? (
            <Field>
              <FieldLabel htmlFor="auth-full-name">نام و نام خانوادگی کامل</FieldLabel>
              <Input
                id="auth-full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                dir="rtl"
                lang="fa-IR"
                maxLength={120}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </Field>
          ) : null}

          <Field>
            <FieldLabel htmlFor="auth-email">ایمیل</FieldLabel>
            <Input
              id="auth-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              dir="ltr"
              lang="en"
              placeholder="email@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="auth-password">رمز عبور</FieldLabel>
            <div className="flex items-center gap-2">
              <Input
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                dir="ltr"
                lang="en"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeClosed aria-hidden /> : <Eye aria-hidden />}
              </Button>
            </div>
          </Field>

          {!isLogin ? (
            <Field>
              <FieldLabel htmlFor="auth-confirm-password">تکرار رمز عبور</FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  id="auth-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  dir="ltr"
                  lang="en"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  aria-label={showConfirmPassword ? "پنهان کردن تکرار رمز" : "نمایش رمز"}
                  onClick={() => setShowConfirmPassword((current) => !current)}
                >
                  {showConfirmPassword ? <EyeClosed aria-hidden /> : <Eye aria-hidden />}
                </Button>
              </div>
            </Field>
          ) : null}

          {isLogin ? (
            <Field orientation="horizontal" className="w-fit">
              <Checkbox
                id="remember-me"
                name="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <FieldLabel htmlFor="remember-me">مرا به خاطر بسپار</FieldLabel>
            </Field>
          ) : (
            <p className="text-sm text-muted-foreground">
              رمز باید حداقل ۸ نویسه، شامل حرف، عدد و نماد باشد.
            </p>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "در حال انجام" : submitLabel}
          </Button>

          <p className="text-sm text-muted-foreground">
            {alternatePrompt}{" "}
            {onModeChange ? (
              <button
                type="button"
                onClick={() => onModeChange(isLogin ? "register" : "login")}
                className="font-medium text-foreground underline-offset-4 hover:underline"
             >
                {alternateAction}
              </button>
            ) : (
              <Link href={alternateHref} className="font-medium text-foreground underline-offset-4 hover:underline">
                {alternateAction}
              </Link>
            )}
          </p>
        </FieldGroup>
      </form>
    </div>
  );
}
