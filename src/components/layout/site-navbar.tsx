"use client";

import { useCallback, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Popover } from "radix-ui";
import {
  CircleUser,
  LogIn,
  Menu,
  Moon,
  Sun,
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
import { siteNavShellClass } from "@/components/layout/site-shell";
import {
  emptyNotificationSummary,
  type NotificationSummary,
} from "@/lib/notification-types";
import { ServiceNavSearch } from "@/components/layout/service-nav-search";
import { cn } from "@/lib/utils";

function useClientReady() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

const navIconButtonClass =
  "size-9 shrink-0 text-muted-foreground hover:bg-card hover:text-foreground data-[state=open]:bg-card data-[state=open]:text-foreground";

function navLinkClass(active: boolean, menu = false) {
  return cn(
    "focus-ring inline-flex items-center rounded-lg font-medium transition-colors outline-none",
    menu ? "min-h-10 w-full justify-start px-3 text-base" : "min-h-9 px-2.5 text-sm",
    active
      ? "bg-card font-semibold text-primary shadow-sm ring-1 ring-border"
      : "text-muted-foreground hover:bg-card/80 hover:text-foreground",
  );
}

function AccountMenu({ email }: { email: string }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button type="button" variant="ghost" size="icon" className={navIconButtonClass} aria-label="حساب کاربری">
          <CircleUser aria-hidden />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="z-[60] flex w-64 flex-col gap-3 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md outline-none"
       >
          <p dir="ltr" lang="en" className="truncate font-mono text-xs text-muted-foreground">
            {email}
          </p>
          <SignOutButton />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function GuestAccountMenu({
  onLogin,
  onRegister,
}: {
  onLogin: () => void;
  onRegister: () => void;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button type="button" variant="ghost" size="icon" className={navIconButtonClass} aria-label="ورود یا ثبت‌نام">
          <UserPlus aria-hidden />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="z-[60] flex w-44 flex-col gap-1.5 rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-md outline-none"
          onOpenAutoFocus={(event) => event.preventDefault()}
       >
          <Popover.Close asChild>
            <Button type="button" variant="outline" size="sm" className="w-full justify-start" onClick={onLogin}>
              <LogIn aria-hidden />
              ورود
            </Button>
          </Popover.Close>
          <Popover.Close asChild>
            <Button type="button" size="sm" className="w-full justify-start" onClick={onRegister}>
              <UserPlus aria-hidden />
              ثبت‌نام
            </Button>
          </Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function NavLink({
  href,
  active,
  menu = false,
  onNavigate,
  children,
}: {
  href: string;
  active: boolean;
  menu?: boolean;
  onNavigate?: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={navLinkClass(active, menu)}
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
  serviceSearch,
}: {
  brand: string;
  physician: boolean;
  patient: boolean;
  showServices: boolean;
  serviceSearch: boolean;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const clientReady = useClientReady();
  const { theme, toggleTheme } = useAppTheme();
  const { openAuth } = useAuthOverlay();
  const signedIn = clientReady && Boolean(session?.user?.email) && !session?.error;
  const [menuOpen, setMenuOpen] = useState(false);
  const [summary, setSummary] = useState<NotificationSummary>(emptyNotificationSummary);
  const onSummary = useCallback((next: NotificationSummary) => {
    setSummary(next);
  }, []);
  const closeMenu = () => setMenuOpen(false);

  const homeActive = pathname === "/";
  const bookHref = homeActive ? "/#services" : "/services";
  const manageActive =
    pathname === "/manage" ||
    pathname.startsWith("/manage/profile") ||
    pathname.startsWith("/manage/patients") ||
    pathname.startsWith("/manage/services");

  const links = (menu: boolean) => (
    <>
      <NavLink href="/" active={homeActive} menu={menu} onNavigate={closeMenu}>
        خانه
      </NavLink>
      {showServices ? (
        <NavLink href="/services" active={pathname === "/services" || pathname.startsWith("/services/")} menu={menu} onNavigate={closeMenu}>
          خدمات
        </NavLink>
      ) : null}
      {patient ? (
        <>
          <NavLink href="/requests" active={pathname === "/requests" || pathname.startsWith("/requests/")} menu={menu} onNavigate={closeMenu}>
            درخواست‌های من
            <UnreadHint count={summary.unreadServiceRequest} label="اعلان خوانده‌نشدهٔ درخواست" />
          </NavLink>
          <NavLink href="/care" active={pathname === "/care" || pathname.startsWith("/care")} menu={menu} onNavigate={closeMenu}>
            پرونده
            <UnreadHint count={summary.unreadCare} label="اعلان خوانده‌نشدهٔ پرونده" />
          </NavLink>
        </>
      ) : null}
      {physician ? (
        <>
          <NavLink href="/manage" active={manageActive} menu={menu} onNavigate={closeMenu}>
            مدیریت
          </NavLink>
          <NavLink
            href="/manage/schedule"
            active={pathname === "/manage/schedule" || pathname.startsWith("/manage/schedule/")}
            menu={menu}
            onNavigate={closeMenu}
          >
            زمان‌بندی
          </NavLink>
          <NavLink
            href="/manage/requests"
            active={pathname === "/manage/requests" || pathname.startsWith("/manage/requests/")}
            menu={menu}
            onNavigate={closeMenu}
          >
            درخواست‌ها
            <UnreadHint count={summary.unreadServiceRequest} label="اعلان خوانده‌نشدهٔ درخواست" />
          </NavLink>
        </>
      ) : null}
    </>
  );

  const account = (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={navIconButtonClass}
        aria-label="تغییر حالت روشن و تاریک"
        onClick={() => toggleTheme()}
      >
        {!clientReady ? (
          <Moon aria-hidden />
        ) : theme === "dark" ? (
          <Sun aria-hidden />
        ) : (
          <Moon aria-hidden />
        )}
      </Button>
      {!clientReady || status === "loading" ? (
        <div className="size-9" aria-hidden />
      ) : signedIn ? (
        <AccountMenu email={session?.user.email ?? ""} />
      ) : (
        <GuestAccountMenu onLogin={() => openAuth("login")} onRegister={() => openAuth("register")} />
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-muted shadow-[0_10px_24px_-18px_color-mix(in_oklch,var(--foreground)_55%,transparent)]">
      <NotificationLive onSummary={onSummary} />
      <nav
        className={cn(siteNavShellClass, "flex items-center justify-between gap-2 py-2.5")}
        aria-label="ناوبری اصلی"
      >
        <Link
          href="/"
          aria-label={brand || "خانه"}
          aria-current={homeActive ? "page" : undefined}
          onClick={closeMenu}
          className="focus-ring inline-flex min-h-9 min-w-0 max-w-[14rem] items-center rounded-lg text-base font-semibold text-foreground outline-none sm:max-w-xs"
        >
          <span className="truncate">{brand || "خانه"}</span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center gap-3 ps-4 lg:flex">
          <div className="flex shrink-0 flex-wrap items-center gap-1">{links(false)}</div>
          {serviceSearch ? <ServiceNavSearch className="min-w-0 flex-1 max-w-xl" /> : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!physician && showServices ? (
            <Button asChild size="sm" className="hidden lg:inline-flex">
              <Link href={bookHref}>رزرو نوبت</Link>
            </Button>
          ) : null}
          {signedIn ? (
            <NotificationCenter summary={summary} onSummary={onSummary} />
          ) : null}
          {account}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={cn(navIconButtonClass, "lg:hidden")}
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
          className="border-t border-border bg-muted lg:hidden"
        >
          <div
            className={cn(
              siteNavShellClass,
              "flex max-h-[calc(100dvh-4.5rem)] flex-col items-stretch gap-1 overflow-y-auto py-3",
            )}
          >
            {links(true)}
            {serviceSearch ? (
              <div className="py-2">
                <ServiceNavSearch />
              </div>
            ) : null}
            {!physician && showServices ? (
              <Button asChild size="default" className="mt-2 h-11">
                <Link href={bookHref} onClick={closeMenu}>
                  رزرو نوبت
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
