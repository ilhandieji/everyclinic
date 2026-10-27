export type NotificationSummary = {
  unreadTotal: number;
  unreadServiceRequest: number;
  unreadCare: number;
};

export const emptyNotificationSummary: NotificationSummary = {
  unreadTotal: 0,
  unreadServiceRequest: 0,
  unreadCare: 0,
};

export const BROWSER_NOTIFICATION_TITLE = "اعلان جدید";
export const BROWSER_NOTIFICATION_BODY =
  "در صندوق اعلان‌ها مطلب تازه‌ای دارید.";
export const INBOX_TOAST_MESSAGE = "اعلان جدید دارید";
