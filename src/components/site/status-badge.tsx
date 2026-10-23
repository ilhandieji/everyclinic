import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusLabel = {
  pending: "در انتظار",
  accepted: "پذیرفته‌شده",
  declined: "رد شده",
  cancelled: "لغو شده",
} as const;

const statusClass = {
  pending: "border-transparent bg-amber-200 text-amber-950 dark:bg-amber-900 dark:text-amber-100",
  accepted: "border-transparent bg-primary text-primary-foreground",
  declined: "border-transparent bg-destructive text-white",
  cancelled: "border-transparent bg-muted text-muted-foreground",
} as const;

export type RequestStatus = keyof typeof statusLabel;

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <Badge variant="outline" className={cn(statusClass[status])}>
      {statusLabel[status]}
    </Badge>
  );
}
