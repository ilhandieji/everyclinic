import { currentUser } from "@/lib/access";
import type { NotificationInboxItem } from "@/lib/notification-types";
import prisma from "@/lib/prisma";

export async function loadNotificationInbox(limit = 50): Promise<NotificationInboxItem[]> {
  const user = await currentUser();
  if (!user) {
    return [];
  }

  const rows = await prisma.notification.findMany({
    where: { recipientUserId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      category: true,
      title: true,
      body: true,
      href: true,
      readAt: true,
      createdAt: true,
    },
  });

  return rows.map((row) => ({
    id: row.id,
    category: row.category,
    title: row.title,
    body: row.body,
    href: row.href,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
}
