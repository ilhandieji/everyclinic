"use client";

import { useCallback, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ClipboardList,
  FolderOpen,
  CalendarDays,
  House,
  Inbox,
  LayoutDashboard,
  LogIn,
  Menu,
  SquarePen,
  Stethoscope,
  UserPlus,
  X,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { useAuthOverlay } from "@/components/auth/auth-overlay";
import { UnreadHint } from "@/components/layout/count-badge";
import { NotificationCenter } from "@/components/layout/notification-center";
import { NotificationLive } from "@/components/layout/notification-live";
import { useAppTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import SkyToggle from "@/components/ui/sky-toggle";
import { siteShellClass } from "@/components/layout/site-shell";
import {
  emptyNotificationSummary,
  type NotificationSummary,
} from "@/lib/notification-types";
import { cn } from "@/lib/utils";

function navLinkClass(active: boolean) {
  return cn(
    "inline-flex items-center gap-1.5 border-b-2 px-1.5 py-1 text-sm font-medium transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring/50",
    active
      ? "border-primary text-foreground"
      : "border-transparent text-muted-foreground hover:text-foreground",
  );
}

function NavLink({
  href,
  active,
  onNavigate,
  children,
}: {
  href: string;
  active: boolean;
  onNavigate?: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={navLinkClass(active)}
      onClick={onNavigate}
    >
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [summary, setSummary] = useState<NotificationSummary>(emptyNotificationSummary);
  const onSummary = useCallback((next: NotificationSummary) => {
    setSummary(next);
  }, []);
  const closeMenu = () => setMenuOpen(false);

  const homeActive = pathname === "/";
  const manageActive =
    pathname === "/manage" ||
    pathname.startsWith("/manage/profile") ||
    pathname.startsWith("/manage/patients");

  const links = (
    <>
      <NavLink href="/" active={homeActive} onNavigate={closeMenu}>
        <House aria-hidden className="size-4" />
        خانه
      </NavLink>
      {showServices ? (
        <NavLink href="/services" active={pathname === "/services" || pathname.startsWith("/services/")} onNavigate={closeMenu}>
          <Stethoscope aria-hidden className="size-4" />
          خدمات
        </NavLink>
      ) : null}
      {patient ? (
        <>
          <NavLink href="/requests" active={pathname === "/requests" || pathname.startsWith("/requests/")} onNavigate={closeMenu}>
            <ClipboardList aria-hidden className="size-4" />
            درخواست‌های من
            <UnreadHint count={summary.unreadServiceRequest} label="اعلان خوانده‌نشدهٔ درخواست" />
          </NavLink>
          <NavLink href="/care" active={pathname === "/care" || pathname.startsWith("/care")} onNavigate={closeMenu}>
            <FolderOpen aria-hidden className="size-4" />
            پرونده
            <UnreadHint count={summary.unreadCare} label="اعلان خوانده‌نشدهٔ پرونده" />
          </NavLink>
        </>
      ) : null}
      {physician ? (
        <>
          <NavLink href="/manage" active={manageActive} onNavigate={closeMenu}>
            <LayoutDashboard aria-hidden className="size-4" />
            مدیریت
          </NavLink>
          <NavLink
            href="/manage/services"
            active={pathname === "/manage/services" || pathname.startsWith("/manage/services/")}
            onNavigate={closeMenu}
          >
            <SquarePen aria-hidden className="size-4" />
            ویرایش خدمات
          </NavLink>
          <NavLink
            href="/manage/schedule"
            active={pathname === "/manage/schedule" || pathname.startsWith("/manage/schedule/")}
            onNavigate={closeMenu}
          >
            <CalendarDays aria-hidden className="size-4" />
            زمان‌بندی
          </NavLink>
          <NavLink
            href="/manage/requests"
            active={pathname === "/manage/requests" || pathname.startsWith("/manage/requests/")}
            onNavigate={closeMenu}
          >
            <Inbox aria-hidden className="size-4" />
            درخواست‌ها
            <UnreadHint count={summary.unreadServiceRequest} label="اعلان خوانده‌نشدهٔ درخواست" />
          </NavLink>
        </>
      ) : null}
    </>
  );

  const account = (
    <>
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
            className="hidden max-w-40 truncate font-mono text-xs text-muted-foreground lg:inline"
          >
            {session?.user.email}
          </span>
          <SignOutButton />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => openAuth("login")}>
            <LogIn aria-hidden />
            ورود
          </Button>
          <Button type="button" size="sm" onClick={() => openAuth("register")}>
            <UserPlus aria-hidden />
            ثبت‌نام
          </Button>
        </div>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <NotificationLive onSummary={onSummary} />
      <nav
        className={cn(siteShellClass, "flex items-center justify-between gap-3 py-2.5")}
        aria-label="ناوبری اصلی"
      >
        <Link
          href="/"
          aria-label={brand || "خانه"}
          aria-current={homeActive ? "page" : undefined}
          onClick={closeMenu}
          className={cn(
            "inline-flex min-w-0 max-w-[40%] items-center gap-1.5 border-b-2 text-sm font-semibold outline-none focus-visible:ring-1 focus-visible:ring-ring/50",
            homeActive
              ? "border-primary text-foreground"
              : "border-transparent text-foreground hover:text-foreground/85",
          )}
        >
          <House aria-hidden className="size-4 shrink-0" />
          <span className="truncate">{brand || "خانه"}</span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center gap-x-4 md:flex">{links}</div>

        <div className="flex items-center gap-2">
          {signedIn ? (
            <NotificationCenter summary={summary} onSummary={onSummary} />
          ) : null}
          {account}
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-11 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="site-nav-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden /> : <Menu aria-hidden />}
            <span className="sr-only">{menuOpen ? "بستن منو" : "باز کردن منو"}</span>
          </Button>
        </div>
      </nav>
      {menuOpen ? (
        <div
          id="site-nav-menu"
          className={cn(siteShellClass, "flex flex-col items-start gap-2 border-t border-border/70 py-3 md:hidden")}
        >
          {links}
        </div>
      ) : null}
    </header>
  );
}
