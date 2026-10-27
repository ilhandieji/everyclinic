"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";
import { currentUser, requirePhysicianPatient } from "@/lib/access";
import prisma from "@/lib/prisma";
import type { ActionState } from "@/lib/actions/state";
import {
  insertNotification,
  notificationDedupeKey,
} from "@/lib/notifications";
import { parseTehranDateTime } from "@/lib/tehran";
import {
  reminderFormSchema,
  reminderStatusSchema,
} from "@/lib/validators/clinical";

function revalidateCare(patientProfileId: string) {
  revalidatePath("/care");
  revalidatePath("/notifications");
  revalidatePath("/manage/patients");
  revalidatePath(`/manage/patients/${patientProfileId}`);
}

export async function createFollowUpReminder(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await currentUser();
  const parsed = reminderFormSchema.safeParse({
    patientProfileId: formData.get("patientProfileId"),
    title: formData.get("title"),
    message: formData.get("message"),
    dueDate: formData.get("dueDate"),
    dueTime: formData.get("dueTime"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است.",
    };
  }
  const scoped = await requirePhysicianPatient(parsed.data.patientProfileId);
  if (!user || !scoped) {
    return { ok: false, error: "اجازه این کار را ندارید." };
  }
  const dueAt = parseTehranDateTime(parsed.data.dueDate, parsed.data.dueTime);
  if (!dueAt) {
    return { ok: false, error: "تاریخ و ساعت موعد را درست وارد کنید." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const reminder = await tx.followUpReminder.create({
        data: {
          patientProfileId: scoped.patient.id,
          physicianProfileId: scoped.physician.id,
          createdByUserId: user.id,
          title: parsed.data.title,
          message: parsed.data.message,
          dueAt,
          status: "pending",
        },
        select: { id: true },
      });
      await tx.reminderDelivery.create({
        data: {
          reminderId: reminder.id,
          kind: "created",
          channel: "in_app",
          idempotencyKey: `reminder:${reminder.id}:created:in_app`,
        },
      });
      await insertNotification(tx, {
        recipientUserId: scoped.patient.userId,
        actorUserId: user.id,
        category: "reminder",
        title: "یادآوری پیگیری",
        body: parsed.data.title,
        href: `/care#reminder-${reminder.id}`,
        dedupeKey: notificationDedupeKey("reminder", reminder.id, "created"),
      });
    });
  } catch {
    console.error("follow-up reminder create failed");
    return { ok: false, error: "یادآوری ثبت نشد." };
  }

  revalidateCare(scoped.patient.id);
  return { ok: true };
}

export async function updateFollowUpReminderStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await currentUser();
  const id = String(formData.get("id") ?? "");
  const parsed = reminderStatusSchema.safeParse(formData.get("status"));
  if (!user || !parsed.success) {
    return { ok: false, error: "اطلاعات نامعتبر است." };
  }

  const reminder = await prisma.followUpReminder.findUnique({
    where: { id },
    select: { patientProfileId: true, physicianProfileId: true, status: true },
  });
  const scoped = reminder
    ? await requirePhysicianPatient(reminder.patientProfileId)
    : null;
  if (!reminder || !scoped || scoped.physician.id !== reminder.physicianProfileId) {
    return { ok: false, error: "اجازه این کار را ندارید." };
  }
  if (reminder.status !== "pending") {
    return { ok: false, error: "این یادآوری دیگر قابل تغییر نیست." };
  }

  try {
    await prisma.followUpReminder.update({
      where: { id },
      data: { status: parsed.data },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("follow-up reminder status failed");
    }
    return { ok: false, error: "وضعیت یادآوری ثبت نشد." };
  }

  revalidateCare(reminder.patientProfileId);
  return { ok: true };
}
