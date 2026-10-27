import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** DESIGN.md — content shell: max 80rem, centered, horizontal padding */
export const siteShellClass = "mx-auto w-full max-w-[80rem] px-4 md:px-8";

/** Short cards, empty states, and compact interactive blocks centered in the shell */
export const sitePanelClass = "mx-auto w-full max-w-2xl";

/** Section intros and help copy (~65ch) */
export const siteProseClass = "mx-auto w-full max-w-prose";

export function SiteShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(siteShellClass, "py-10", className)}>{children}</div>;
}
