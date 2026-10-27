"use server";

import { revalidatePath } from "next/cache";
import { currentUser, requirePhysicianPatient } from "@/lib/access";
import prisma from "@/lib/prisma";
import type { ActionState } from "@/lib/actions/state";
import {
  insertNotification,
  notificationDedupeKey,
} from "@/lib/notifications";
import {
  medicationStatusFormSchema,
  prescriptionFormSchema,
} from "@/lib/validators/clinical";

function revalidateCare(patientProfileId: string) {
  revalidatePath("/care");
  revalidatePath("/notifications");
  revalidatePath(`/manage/patients/${patientProfileId}`);
}

export async function createPrescription(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await currentUser();
  const parsed = prescriptionFormSchema.safeParse({
    patientProfileId: formData.get("patientProfileId"),
    medicationName: formData.get("medicationName"),
    dosage: formData.get("dosage"),
    frequency: formData.get("frequency"),
    notes: formData.get("notes") ?? "",
    startDate: formData.get("startDate"),
    renewsId: formData.get("renewsId") || undefined,
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

  const startDate = new Date(`${parsed.data.startDate}T00:00:00+03:30`);
  if (Number.isNaN(startDate.getTime())) {
    return { ok: false, error: "تاریخ شروع نامعتبر است." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      let renewsId: string | undefined;
      if (parsed.data.renewsId) {
        const previous = await tx.prescription.findFirst({
          where: {
            id: parsed.data.renewsId,
            patientProfileId: scoped.patient.id,
            physicianProfileId: scoped.physician.id,
          },
          select: {
            id: true,
            statusEvents: { orderBy: { occurredAt: "desc" }, take: 1 },
          },
        });
        if (!previous) {
          throw new Error("renewal-missing");
        }
        const previousStatus = previous.statusEvents[0]?.status ?? "active";
        if (previousStatus !== "active") {
          throw new Error("renewal-inactive");
        }
        renewsId = previous.id;
        await tx.medicationStatusEvent.create({
          data: {
            prescriptionId: previous.id,
            status: "completed",
            authoredByUserId: user.id,
            endDate: startDate,
            note: "تمدید با نسخهٔ جدید",
          },
        });
      }

      const prescription = await tx.prescription.create({
        data: {
          patientProfileId: scoped.patient.id,
          physicianProfileId: scoped.physician.id,
          authoredByUserId: user.id,
          medicationName: parsed.data.medicationName,
          dosage: parsed.data.dosage,
          frequency: parsed.data.frequency,
          notes: parsed.data.notes.length > 0 ? parsed.data.notes : null,
          prescribedAt: new Date(),
          startDate,
          renewsId,
        },
        select: { id: true },
      });
      await tx.medicationStatusEvent.create({
        data: {
          prescriptionId: prescription.id,
          status: "active",
          authoredByUserId: user.id,
        },
      });
      await insertNotification(tx, {
        recipientUserId: scoped.patient.userId,
        actorUserId: user.id,
        category: "medication",
        title: renewsId ? "تمدید دارو" : "داروی جدید در پرونده",
        body: parsed.data.medicationName,
        href: `/care#prescription-${prescription.id}`,
        dedupeKey: notificationDedupeKey(
          "medication",
          prescription.id,
          renewsId ? "renewed" : "created",
        ),
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "renewal-missing") {
      return { ok: false, error: "اجازه این کار را ندارید." };
    }
    if (error instanceof Error && error.message === "renewal-inactive") {
      return { ok: false, error: "این نسخه دیگر فعال نیست." };
    }
    console.error("prescription create failed");
    return { ok: false, error: "نسخه ثبت نشد." };
  }

  revalidateCare(scoped.patient.id);
  return { ok: true };
}

export async function appendMedicationStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await currentUser();
  const parsed = medicationStatusFormSchema.safeParse({
    prescriptionId: formData.get("prescriptionId"),
    status: formData.get("status"),
    endDate: formData.get("endDate") ?? "",
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است.",
    };
  }
  const prescription = await prisma.prescription.findUnique({
    where: { id: parsed.data.prescriptionId },
    select: {
      id: true,
      patientProfileId: true,
      physicianProfileId: true,
      medicationName: true,
      patient: { select: { userId: true } },
      statusEvents: { orderBy: { occurredAt: "desc" }, take: 1 },
    },
  });
  const scoped = prescription
    ? await requirePhysicianPatient(prescription.patientProfileId)
    : null;
  if (
    !user ||
    !prescription ||
    !scoped ||
    scoped.physician.id !== prescription.physicianProfileId
  ) {
    return { ok: false, error: "اجازه این کار را ندارید." };
  }
  const current = prescription.statusEvents[0]?.status ?? "active";
  if (current !== "active") {
    return { ok: false, error: "این نسخه دیگر فعال نیست." };
  }

  const endDate =
    parsed.data.endDate && parsed.data.endDate.length > 0
      ? new Date(`${parsed.data.endDate}T00:00:00+03:30`)
      : null;
  if (endDate && Number.isNaN(endDate.getTime())) {
    return { ok: false, error: "تاریخ پایان نامعتبر است." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const event = await tx.medicationStatusEvent.create({
        data: {
          prescriptionId: prescription.id,
          status: parsed.data.status,
          authoredByUserId: user.id,
          endDate,
          note: parsed.data.note.length > 0 ? parsed.data.note : null,
        },
        select: { id: true },
      });
      await insertNotification(tx, {
        recipientUserId: prescription.patient.userId,
        actorUserId: user.id,
        category: "medication",
        title:
          parsed.data.status === "completed" ? "پایان دورهٔ دارو" : "قطع دارو",
        body: prescription.medicationName,
        href: `/care#prescription-${prescription.id}`,
        dedupeKey: notificationDedupeKey(
          "medication",
          event.id,
          parsed.data.status,
        ),
      });
    });
  } catch {
    console.error("medication status failed");
    return { ok: false, error: "وضعیت دارو ثبت نشد." };
  }

  revalidateCare(prescription.patientProfileId);
  return { ok: true };
}
