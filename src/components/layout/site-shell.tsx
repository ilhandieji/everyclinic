import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** DESIGN.md — content shell: max 80rem, centered, horizontal padding */
export const siteShellClass = "mx-auto w-full max-w-[80rem] px-4 md:px-8";

/** Primary navigation uses the same content width as the page */
export const siteNavShellClass = siteShellClass;

/** Short cards, empty states, and compact interactive blocks centered in the shell */
export const sitePanelClass = "mx-auto w-full max-w-2xl";

/** Manage forms: centered so fields do not stretch the 80rem shell */
export const siteFormClass = "mx-auto w-full max-w-3xl";

/** Section intros and help copy (~65ch) */
export const siteProseClass = "mx-auto w-full max-w-prose";

/** Home and /services: one column, then two, then three even tracks */
export const siteServiceGridClass = "grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-3";

export function SiteShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(siteShellClass, "py-10", className)}>{children}</div>;
}

export function SiteLoading({ label }: { label: string }) {
  return (
    <SiteShell>
      <p role="status" className="text-sm text-muted-foreground">
        {label}
      </p>
    </SiteShell>
  );
}
