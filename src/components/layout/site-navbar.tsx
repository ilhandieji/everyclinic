"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { useAppTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import SkyToggle from "@/components/ui/sky-toggle";

export function SiteNavbar() {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useAppTheme();
  const signedIn = Boolean(session?.user?.email) && !session?.error;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <nav
        className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-2"
        aria-label="ناوبری اصلی"
      >
        <Link
          href="/"
          className="text-sm font-semibold text-foreground hover:text-foreground/80 rounded-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
        >
          فروشگاه
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
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
              <Button asChild size="sm" variant="outline">
                <Link href="/login">ورود</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">ثبت‌نام</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
