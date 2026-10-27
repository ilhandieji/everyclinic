import { Prisma } from "@/app/generated/prisma/client";
import {
  BROWSER_NOTIFICATION_BODY,
  BROWSER_NOTIFICATION_TITLE,
} from "@/lib/notification-types";
import { safeCallbackUrl } from "@/lib/validators/auth";

export const NOTIFICATION_CATEGORIES = [
  "service_request",
  "reminder",
  "medication",
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export type NotificationWrite = {
  recipientUserId: string;
  actorUserId: string;
  category: NotificationCategory;
  title: string;
  body: string;
  href: string;
  dedupeKey: string;
};

type NotificationStore = {
  notification: {
    create: (args: {
      data: {
        recipientUserId: string;
        category: NotificationCategory;
        title: string;
        body: string;
        href: string;
        dedupeKey: string;
      };
    }) => Promise<unknown>;
  };
};

export function notificationHref(path: string): string {
  return safeCallbackUrl(path);
}

export function notificationDedupeKey(
  category: NotificationCategory,
  subjectId: string,
  event: string,
): string {
  return `${category}:${subjectId}:${event}`;
}

export {
  BROWSER_NOTIFICATION_BODY,
  BROWSER_NOTIFICATION_TITLE,
  INBOX_TOAST_MESSAGE,
} from "@/lib/notification-types";

export function isGenericBrowserCopy(title: string, body: string): boolean {
  return title === BROWSER_NOTIFICATION_TITLE && body === BROWSER_NOTIFICATION_BODY;
}

export async function insertNotification(
  db: NotificationStore,
  input: NotificationWrite,
): Promise<void> {
  if (input.recipientUserId === input.actorUserId) {
    return;
  }
  const href = notificationHref(input.href);
  try {
    await db.notification.create({
      data: {
        recipientUserId: input.recipientUserId,
        category: input.category,
        title: input.title,
        body: input.body,
        href,
        dedupeKey: input.dedupeKey,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return;
    }
    throw error;
  }
}

export function latestStatus<T extends { occurredAt: Date }>(events: T[]): T | null {
  if (events.length === 0) {
    return null;
  }
  return events.reduce((latest, event) =>
    event.occurredAt.getTime() >= latest.occurredAt.getTime() ? event : latest,
  );
}
