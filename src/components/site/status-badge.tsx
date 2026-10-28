import { Badge } from "@/components/ui/badge";

const statusLabel = {
  pending: "در انتظار",
  accepted: "پذیرفته‌شده",
  declined: "رد شده",
  cancelled: "لغو شده",
} as const;

const statusClass = {
  pending: "border-transparent",
  accepted: "border-transparent",
  declined: "border-transparent bg-destructive/10 text-destructive",
  cancelled: "border-transparent bg-muted text-muted-foreground",
} as const;

const statusStyle = {
  pending: {
    backgroundColor: "var(--status-pending)",
    color: "var(--status-pending-foreground)",
  },
  accepted: {
    backgroundColor: "var(--status-accepted)",
    color: "var(--status-accepted-foreground)",
  },
} as const;

export type RequestStatus = keyof typeof statusLabel;

export function StatusBadge({ status }: { status: RequestStatus }) {
  const tone = status === "pending" || status === "accepted" ? statusStyle[status] : undefined;
  return (
    <Badge variant="outline" className={statusClass[status]} style={tone}>
      {statusLabel[status]}
    </Badge>
  );
}
