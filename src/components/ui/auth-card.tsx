"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeClosed,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { safeCallbackUrl } from "@/lib/validators/auth";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

type FocusField = "email" | "password" | "confirmPassword" | null;

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<FocusField>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const isLogin = mode === "login";

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!isLogin) {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, confirmPassword }),
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
  const alternatePrompt = isLogin
    ? "حساب کاربری ندارید؟"
    : "قبلاً ثبت‌نام کرده‌اید؟";
  const alternateAction = isLogin ? "ثبت‌نام" : "ورود";

  return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative group">
            <div className="relative rounded-2xl border border-border bg-card/80 p-6 shadow-lg backdrop-blur-md overflow-hidden text-card-foreground">
              <div className="text-center space-y-1 mb-5">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="mx-auto w-10 h-10 rounded-full border border-white/10 flex items-center justify-center relative overflow-hidden"
                >
                  <span className="text-lg font-bold text-primary">
                    ف
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-bold text-foreground"
                >
                  {title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground text-xs"
                >
                  {subtitle}
                </motion.p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {error ? (
                  <p
                    role="alert"
                    className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 text-center"
                  >
                    {error}
                  </p>
                ) : null}

                <div className="space-y-3">
                  <div
                    className={cn(
                      "relative",
                      focusedInput === "email" && "z-10",
                    )}
                  >
                    <label htmlFor="auth-email" className="sr-only">
                      ایمیل
                    </label>
                    <div dir="ltr" className="relative flex items-center rounded-lg">
                      <Mail
                        className={cn(
                          "absolute start-3 w-4 h-4 transition-all duration-300",
                          focusedInput === "email"
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                        aria-hidden
                      />
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
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedInput("email")}
                        onBlur={() => setFocusedInput(null)}
                        className="w-full border-input bg-background/40 text-foreground placeholder:text-muted-foreground h-10 transition-all duration-300 ps-10 pe-3 focus:bg-background/70 text-start"
                      />
                    </div>
                  </div>

                  <div
                    className={cn(
                      "relative",
                      focusedInput === "password" && "z-10",
                    )}
                  >
                    <label htmlFor="auth-password" className="sr-only">
                      رمز عبور
                    </label>
                    <div dir="ltr" className="relative flex items-center rounded-lg">
                      <Lock
                        className={cn(
                          "absolute start-3 w-4 h-4 transition-all duration-300",
                          focusedInput === "password"
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                        aria-hidden
                      />
                      <Input
                        id="auth-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={
                          isLogin ? "current-password" : "new-password"
                        }
                        required
                        dir="ltr"
                        placeholder="رمز عبور"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedInput("password")}
                        onBlur={() => setFocusedInput(null)}
                        className="w-full border-input bg-background/40 text-foreground placeholder:text-muted-foreground h-10 transition-all duration-300 ps-10 pe-10 focus:bg-background/70 text-start"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute end-3 cursor-pointer text-muted-foreground hover:text-foreground transition-colors duration-300"
                        aria-label={
                          showPassword ? "پنهان کردن رمز" : "نمایش رمز"
                        }
                      >
                        {showPassword ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeClosed className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {!isLogin ? (
                    <div
                      className={cn(
                        "relative",
                        focusedInput === "confirmPassword" && "z-10",
                      )}
                    >
                      <label htmlFor="auth-confirm-password" className="sr-only">
                        تکرار رمز عبور
                      </label>
                      <div dir="ltr" className="relative flex items-center rounded-lg">
                        <Lock
                          className={cn(
                            "absolute start-3 w-4 h-4 transition-all duration-300",
                            focusedInput === "confirmPassword"
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                          aria-hidden
                        />
                        <Input
                          id="auth-confirm-password"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                          dir="ltr"
                          placeholder="تکرار رمز عبور"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onFocus={() => setFocusedInput("confirmPassword")}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full border-input bg-background/40 text-foreground placeholder:text-muted-foreground h-10 transition-all duration-300 ps-10 pe-10 focus:bg-background/70 text-start"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute end-3 cursor-pointer text-muted-foreground hover:text-foreground transition-colors duration-300"
                          aria-label={
                            showConfirmPassword
                              ? "پنهان کردن تکرار رمز"
                              : "نمایش تکرار رمز"
                          }
                        >
                          {showConfirmPassword ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeClosed className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                {isLogin ? (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="relative">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="appearance-none h-4 w-4 rounded border border-border bg-background/40 checked:bg-primary checked:border-primary focus:outline-none focus:ring-1 focus:ring-ring/40 transition-all duration-200"
                      />
                      {rememberMe ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center text-primary-foreground pointer-events-none"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </motion.div>
                      ) : null}
                    </div>
                    <label
                      htmlFor="remember-me"
                      className="text-xs text-muted-foreground hover:text-foreground/80 transition-colors duration-200 cursor-pointer"
                    >
                      مرا به خاطر بسپار
                    </label>
                  </div>
                ) : (
                  <p className="text-[11px] leading-relaxed text-muted-foreground pt-1">
                    رمز باید حداقل ۸ نویسه، شامل حرف، عدد و نماد باشد.
                  </p>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group/button mt-2"
                >
                  <div className="relative overflow-hidden bg-primary text-primary-foreground font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-70">
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center"
                        >
                          <div className="w-4 h-4 border-2 border-primary-foreground/70 border-t-transparent rounded-full animate-spin" />
                          <span className="sr-only">در حال انجام</span>
                        </motion.div>
                      ) : (
                        <motion.span
                          key="button-text"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-1 text-sm font-medium"
                        >
                          {submitLabel}
                          <ArrowLeft className="w-3 h-3 group-hover/button:-translate-x-0.5 transition-transform duration-300" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>

                <motion.p
                  className="text-center text-xs text-muted-foreground mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {alternatePrompt}{" "}
                  {onModeChange ? (
                    <button
                      type="button"
                      onClick={() => onModeChange(isLogin ? "register" : "login")}
                      className="font-medium text-foreground"
                    >
                      {alternateAction}
                    </button>
                  ) : (
                    <Link
                      href={alternateHref}
                      className="relative inline-block group/signup"
                    >
                      <span className="relative z-10 text-foreground group-hover/signup:text-foreground/70 transition-colors duration-300 font-medium">
                        {alternateAction}
                      </span>
                      <span className="absolute bottom-0 start-0 w-0 h-px bg-foreground group-hover/signup:w-full transition-all duration-300" />
                    </Link>
                  )}
                </motion.p>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
  );
}
