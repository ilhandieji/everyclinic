export type NotificationSummary = {
  unreadTotal: number;
  unreadServiceRequest: number;
  unreadCare: number;
};

export type NotificationInboxItem = {
  id: string;
  category: "service_request" | "reminder" | "medication";
  title: string;
  body: string;
  href: string;
  readAt: string | null;
  createdAt: string;
};

export const notificationCategoryLabel = {
  service_request: "درخواست رزرو",
  reminder: "یادآوری",
  medication: "دارو",
} as const;

export const emptyNotificationSummary: NotificationSummary = {
  unreadTotal: 0,
  unreadServiceRequest: 0,
  unreadCare: 0,
};

/** Client polling compares against this sessionStorage key after inbox clears. */
export const NOTIFICATION_UNREAD_TOTAL_STORAGE_KEY = "clinic-unread-total";

/** Fired on `window` after the inbox is cleared so live badges reset immediately. */
export const NOTIFICATIONS_CLEARED_EVENT = "clinic-notifications-cleared";

export const BROWSER_NOTIFICATION_TITLE = "اعلان جدید";
export const BROWSER_NOTIFICATION_BODY =
  "در صندوق اعلان‌ها مطلب تازه‌ای دارید.";
export const INBOX_TOAST_MESSAGE = "اعلان جدید دارید";
