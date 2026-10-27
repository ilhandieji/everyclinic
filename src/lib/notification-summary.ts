import { currentUser } from "@/lib/access";
import type { NotificationSummary } from "@/lib/notification-types";
import { emptyNotificationSummary } from "@/lib/notification-types";
import prisma from "@/lib/prisma";

export type { NotificationSummary } from "@/lib/notification-types";
export { emptyNotificationSummary } from "@/lib/notification-types";

export async function loadNotificationSummary(): Promise<NotificationSummary> {
  const user = await currentUser();
  if (!user) {
    return emptyNotificationSummary;
  }

  const [unreadTotal, unreadServiceRequest, unreadCare] = await Promise.all([
    prisma.notification.count({
      where: { recipientUserId: user.id, readAt: null },
    }),
    prisma.notification.count({
      where: {
        recipientUserId: user.id,
        readAt: null,
        category: "service_request",
      },
    }),
    prisma.notification.count({
      where: {
        recipientUserId: user.id,
        readAt: null,
        category: { in: ["reminder", "medication"] },
      },
    }),
  ]);

  return { unreadTotal, unreadServiceRequest, unreadCare };
}
