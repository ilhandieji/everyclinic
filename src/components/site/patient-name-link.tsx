import Link from "next/link";
import { User } from "lucide-react";
import { displayPatientName } from "@/lib/patient-name";
import { cn } from "@/lib/utils";

/** Fixed placeholder — patients do not upload profile photos in this release. */
export function DefaultPatientAvatar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-neutral-100 text-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
        className,
      )}
    >
      <User className="size-4" strokeWidth={1.75} />
    </span>
  );
}

export function PatientNameLink({
  href,
  name,
}: {
  href: string;
  name: string | null | undefined;
}) {
  return (
    <Link
      href={href}
      dir="auto"
      className="flex w-fit max-w-full items-center gap-2 text-sm font-medium text-foreground hover:underline"
    >
      <DefaultPatientAvatar />
      <span className="min-w-0 truncate">{displayPatientName(name)}</span>
    </Link>
  );
}
