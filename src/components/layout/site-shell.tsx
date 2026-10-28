import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** DESIGN.md — content shell: max 80rem, centered, horizontal padding */
export const siteShellClass = "mx-auto w-full max-w-[80rem] px-4 md:px-8";

/** Narrower bar for primary navigation */
export const siteNavShellClass = "mx-auto w-full max-w-[66rem] px-3 sm:px-5 md:px-6";

/** Short cards, empty states, and compact interactive blocks centered in the shell */
export const sitePanelClass = "mx-auto w-full max-w-2xl";

/** Manage forms: centered so fields do not stretch the 80rem shell */
export const siteFormClass = "mx-auto w-full max-w-3xl";

/** Section intros and help copy (~65ch) */
export const siteProseClass = "mx-auto w-full max-w-prose";

/** Home and /services: auto-fit grid; cards grow up to ~19.5rem (see DESIGN.md) */
export const siteServiceGridClass =
  "mx-auto grid w-full max-w-[62.5rem] gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,17.25rem),19.5rem))]";

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
