"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";
import { currentPatient, currentPhysician } from "@/lib/access";
import prisma from "@/lib/prisma";
import { requestFormSchema } from "@/lib/validators/site";
import type { ActionState } from "@/lib/actions/profile";

function revalidateRequest(serviceId: string) {
  revalidatePath("/manage/requests");
  revalidatePath("/manage/patients");
  revalidatePath("/requests");
  revalidatePath(`/services/${serviceId}`);
  revalidatePath("/services");
}

export async function createServiceRequest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const patient = await currentPatient();
  if (!patient) {
    return { ok: false, error: "برای درخواست باید وارد حساب بیمار شوید." };
  }

  const parsed = requestFormSchema.safeParse({
    serviceId: formData.get("serviceId"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const service = await tx.medicalService.findFirst({
        where: { id: parsed.data.serviceId, published: true },
        select: { id: true },
      });
      if (!service) {
        throw new Error("unpublished");
      }
      await tx.serviceRequest.create({
        data: {
          patientProfileId: patient.id,
          serviceId: service.id,
          note: parsed.data.note.length > 0 ? parsed.data.note : null,
          status: "pending",
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "unpublished") {
      return { ok: false, error: "این خدمت برای درخواست باز نیست." };
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, error: "برای این خدمت یک درخواست باز دارید." };
    }
    console.error("service request failed");
    return { ok: false, error: "درخواست ثبت نشد." };
  }

  revalidateRequest(parsed.data.serviceId);
  return { ok: true };
}

export async function cancelServiceRequest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const patient = await currentPatient();
  if (!patient) {
    return { ok: false, error: "اجازه این کار را ندارید." };
  }
  const id = String(formData.get("id") ?? "");
  const updated = await prisma.serviceRequest.updateMany({
    where: { id, patientProfileId: patient.id, status: "pending" },
    data: { status: "cancelled" },
  });
  if (updated.count !== 1) {
    return { ok: false, error: "این درخواست قابل لغو نیست." };
  }
  const row = await prisma.serviceRequest.findUnique({
    where: { id },
    select: { serviceId: true },
  });
  if (row) {
    revalidateRequest(row.serviceId);
  }
  return { ok: true };
}

async function decide(
  id: string,
  status: "accepted" | "declined",
): Promise<ActionState> {
  const physician = await currentPhysician();
  if (!physician) {
    return { ok: false, error: "اجازه این کار را ندارید." };
  }

  try {
    const serviceId = await prisma.$transaction(async (tx) => {
      const request = await tx.serviceRequest.findFirst({
        where: {
          id,
          status: "pending",
          service: { physicianProfileId: physician.id },
        },
        select: {
          id: true,
          serviceId: true,
          patientProfileId: true,
        },
      });
      if (!request) {
        return null;
      }
      const updated = await tx.serviceRequest.updateMany({
        where: { id: request.id, status: "pending" },
        data: { status },
      });
      if (updated.count !== 1) {
        return null;
      }
      if (status === "accepted") {
        await tx.careRelationship.upsert({
          where: {
            physicianProfileId_patientProfileId: {
              physicianProfileId: physician.id,
              patientProfileId: request.patientProfileId,
            },
          },
          create: {
            physicianProfileId: physician.id,
            patientProfileId: request.patientProfileId,
          },
          update: {},
        });
      }
      return request.serviceId;
    });

    if (!serviceId) {
      return { ok: false, error: "این درخواست دیگر در انتظار نیست." };
    }
    revalidateRequest(serviceId);
    return { ok: true };
  } catch {
    console.error("service request decision failed");
    return { ok: false, error: "تصمیم ثبت نشد." };
  }
}

export async function acceptServiceRequest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return decide(String(formData.get("id") ?? ""), "accepted");
}

export async function declineServiceRequest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return decide(String(formData.get("id") ?? ""), "declined");
}
