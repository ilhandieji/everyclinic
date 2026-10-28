import type { ReactNode } from "react";

export function HelpDisclosure({
  summary,
  children,
}: {
  summary: string;
  children: ReactNode;
}) {
  return (
    <details className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
      <summary className="cursor-pointer font-medium text-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        {summary}
      </summary>
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </details>
  );
}
