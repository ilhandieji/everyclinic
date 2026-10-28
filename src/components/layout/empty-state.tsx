import type { ReactNode } from "react";

export function EmptyState({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-4">
      <p className="text-sm text-muted-foreground">{children}</p>
      {action}
    </div>
  );
}
