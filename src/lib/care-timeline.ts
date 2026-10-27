export type TimelineKind =
  | "service_request"
  | "prescription"
  | "medication_status"
  | "reminder";

export type ServiceRequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled";

export type TimelineEntry = {
  id: string;
  at: Date;
  kind: TimelineKind;
  title: string;
  detail: string;
  href: string | null;
  status?: ServiceRequestStatus;
};

export function serviceRequestTimelineTitle(
  status: ServiceRequestStatus,
): string {
  switch (status) {
    case "pending":
      return "درخواست رزرو در انتظار";
    case "accepted":
      return "درخواست رزرو پذیرفته‌شده";
    case "declined":
      return "درخواست رزرو رد شده";
    case "cancelled":
      return "درخواست رزرو لغو شده";
  }
}

export function isCompletedVisit(kind: TimelineKind): boolean {
  void kind;
  return false;
}

export function sortTimeline(entries: TimelineEntry[]): TimelineEntry[] {
  return [...entries].sort((a, b) => b.at.getTime() - a.at.getTime());
}
