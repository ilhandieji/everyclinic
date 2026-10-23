"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { useAuthOverlay } from "@/components/auth/auth-overlay";
import { useAppTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import SkyToggle from "@/components/ui/sky-toggle";
import { cn } from "@/lib/utils";

function navLinkClass(active: boolean) {
  return cn(
    "border-b-2 px-1.5 py-1 text-sm font-medium transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring/50",
    active
      ? "border-accent text-foreground"
      : "border-transparent text-muted-foreground hover:text-foreground",
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={navLinkClass(active)}>
      {children}
    </Link>
  );
}

export function SiteNavbar({
  brand,
  physician,
  patient,
  showServices,
}: {
  brand: string;
  physician: boolean;
  patient: boolean;
  showServices: boolean;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useAppTheme();
  const { openAuth } = useAuthOverlay();
  const signedIn = Boolean(session?.user?.email) && !session?.error;

  const homeActive = pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <nav
        className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-2.5"
        aria-label="ناوبری اصلی"
      >
        <Link
          href="/"
          aria-label={brand || "خانه"}
          aria-current={homeActive ? "page" : undefined}
          className={cn(
            "min-w-0 max-w-[40%] truncate border-b-2 text-sm font-semibold outline-none focus-visible:ring-1 focus-visible:ring-ring/50",
            homeActive
              ? "border-accent text-foreground"
              : "border-transparent text-foreground hover:text-foreground/85",
          )}
        >
          {brand || "خانه"}
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 sm:gap-x-4">
          {showServices ? (
            <NavLink href="/services" active={pathname === "/services" || pathname.startsWith("/services/")}>
              خدمات
            </NavLink>
          ) : null}
          {patient ? (
            <NavLink href="/requests" active={pathname === "/requests" || pathname.startsWith("/requests/")}>
              درخواست‌های من
            </NavLink>
          ) : null}
          {physician ? (
            <>
              <NavLink
                href="/manage/services"
                active={pathname === "/manage/services" || pathname.startsWith("/manage/services/")}
              >
                ویرایش خدمات
              </NavLink>
              <NavLink
                href="/manage/requests"
                active={pathname === "/manage/requests" || pathname.startsWith("/manage/requests/")}
              >
                درخواست‌ها
              </NavLink>
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
