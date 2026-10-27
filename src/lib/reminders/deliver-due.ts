import { Prisma } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";
import {
  insertNotification,
  notificationDedupeKey,
} from "@/lib/notifications";

/**
 * Records one in-app due notification per pending reminder whose dueAt has passed.
 * Nothing in the app or Compose calls this on a schedule. Run it only from an
 * approved server-side job. A reminder row is not proof of delivery.
 */
export async function deliverDueReminders(now = new Date()): Promise<number> {
  const due = await prisma.followUpReminder.findMany({
    where: {
      status: "pending",
      dueAt: { lte: now },
    },
    select: {
      id: true,
      title: true,
      patient: { select: { userId: true } },
      physician: { select: { userId: true } },
    },
  });

  let delivered = 0;
  for (const reminder of due) {
    const idempotencyKey = `reminder:${reminder.id}:due:in_app`;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.reminderDelivery.create({
          data: {
            reminderId: reminder.id,
            kind: "due",
            channel: "in_app",
            idempotencyKey,
          },
        });
        await insertNotification(tx, {
          recipientUserId: reminder.patient.userId,
          actorUserId: reminder.physician.userId,
          category: "reminder",
          title: "موعد یادآوری",
          body: reminder.title,
          href: `/care#reminder-${reminder.id}`,
          dedupeKey: notificationDedupeKey("reminder", reminder.id, "due"),
        });
      });
      delivered += 1;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        continue;
      }
      console.error("due reminder delivery failed");
    }
  }
  return delivered;
}
