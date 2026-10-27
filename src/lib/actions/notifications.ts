"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/access";
import { loadNotificationSummary } from "@/lib/notification-summary";
import prisma from "@/lib/prisma";
import { notificationHref } from "@/lib/notifications";

export async function unreadNotificationSummary() {
  return loadNotificationSummary();
}

export async function openNotification(formData: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }
  const id = String(formData.get("id") ?? "");
  const row = await prisma.notification.findFirst({
    where: { id, recipientUserId: user.id },
    select: { href: true },
  });
  if (!row) {
    redirect("/notifications");
  }
  await prisma.notification.updateMany({
    where: { id, recipientUserId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/notifications");
  redirect(notificationHref(row.href));
}

export async function markNotificationRead(formData: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) {
    return;
  }
  const id = String(formData.get("id") ?? "");
  await prisma.notification.updateMany({
    where: { id, recipientUserId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/notifications");
}
