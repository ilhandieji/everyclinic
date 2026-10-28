import type { ReactNode } from "react";

export function PageHeader({
  title,
  lede,
  actions,
}: {
  title: string;
  lede?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 dir="auto" className="text-xl font-semibold text-foreground">{title}</h1>
        {actions}
      </div>
      {lede ? <p className="max-w-[65ch] text-sm text-muted-foreground">{lede}</p> : null}
    </header>
  );
}
