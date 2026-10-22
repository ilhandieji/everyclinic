"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { useAuthOverlay } from "@/components/auth/auth-overlay";
import { useAppTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import SkyToggle from "@/components/ui/sky-toggle";

export function SiteNavbar({
  brand,
  physician,
  showServices,
}: {
  brand: string;
  physician: boolean;
  showServices: boolean;
}) {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useAppTheme();
  const { openAuth } = useAuthOverlay();
  const signedIn = Boolean(session?.user?.email) && !session?.error;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <nav
        className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-2"
        aria-label="ناوبری اصلی"
      >
        <Link
          href="/"
          aria-label={brand || "خانه"}
          className="min-w-0 max-w-[40%] truncate rounded-sm text-sm font-semibold text-foreground outline-none hover:text-foreground/80 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
        >
          {brand}
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          {showServices ? (
            <Button asChild size="sm" variant="ghost">
              <Link href="/services">خدمات</Link>
            </Button>
          ) : null}
          {physician ? (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href="/manage/services">ویرایش خدمات</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href="/manage/requests">درخواست‌ها</Link>
              </Button>
            </>
          ) : null}
          <SkyToggle
            checked={theme === "dark"}
            onCheckedChange={() => toggleTheme()}
            label="تغییر حالت روشن و تاریک"
          />

          {status === "loading" ? (
            <div className="h-7 min-w-28" aria-hidden />
          ) : signedIn ? (
            <div className="flex items-center gap-2">
              <span
                dir="ltr"
                lang="en"
                className="hidden max-w-40 truncate font-mono text-xs text-muted-foreground sm:inline"
              >
                {session?.user.email}
              </span>
              <SignOutButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => openAuth("login")}
              >
                ورود
              </Button>
              <Button type="button" size="sm" onClick={() => openAuth("register")}>
                ثبت‌نام
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
