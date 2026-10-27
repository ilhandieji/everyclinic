"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/access";
import { loadNotificationSummary } from "@/lib/notification-summary";
import prisma from "@/lib/prisma";
import { notificationHref } from "@/lib/notifications";

function revalidateNotificationSurfaces() {
  revalidatePath("/notifications");
  revalidatePath("/");
  revalidatePath("/care");
  revalidatePath("/requests");
  revalidatePath("/manage");
  revalidatePath("/manage/requests");
}

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
  revalidateNotificationSurfaces();
  redirect(notificationHref(row.href));
}

export async function markNotificationRead(formData: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) {
    return;
  }
  const id = String(formData.get("id") ?? "");
  await markNotificationReadById(id);
}

export async function markNotificationReadById(id: string): Promise<boolean> {
  const user = await currentUser();
  if (!user || !id) {
    return false;
  }
  const result = await prisma.notification.updateMany({
    where: { id, recipientUserId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidateNotificationSurfaces();
  return result.count > 0;
}

export async function clearAllNotifications(): Promise<boolean> {
  const user = await currentUser();
  if (!user) {
    return false;
  }
  await prisma.notification.deleteMany({
    where: { recipientUserId: user.id },
  });
  revalidateNotificationSurfaces();
  return true;
}

export async function openNotificationById(id: string): Promise<string | null> {
  const user = await currentUser();
  if (!user || !id) {
    return null;
  }
  const row = await prisma.notification.findFirst({
    where: { id, recipientUserId: user.id },
    select: { href: true },
  });
  if (!row) {
    return null;
  }
  await prisma.notification.updateMany({
    where: { id, recipientUserId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidateNotificationSurfaces();
  return notificationHref(row.href);
}
