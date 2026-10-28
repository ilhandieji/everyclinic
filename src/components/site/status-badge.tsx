import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusLabel = {
  pending: "در انتظار",
  accepted: "پذیرفته‌شده",
  declined: "رد شده",
  cancelled: "لغو شده",
} as const;

const statusClass = {
  pending:
    "border-transparent bg-[var(--status-pending)] text-[var(--status-pending-foreground)]",
  accepted: "border-transparent bg-primary text-primary-foreground",
  declined: "border-transparent bg-destructive/10 text-destructive",
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
