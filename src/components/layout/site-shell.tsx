import type { ReactNode } from "react";
import { cn } from "cn";

export const siteShellClass = "mx-auto w-full max-w-[80rem] px-4 md:px-8";

export function SiteShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(siteShellClass, "py-10", className)}>{children}</div>;
}
