"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/app/generated/prisma/client";
import { currentPhysician } from "@/lib/access";
import prisma from "@/lib/prisma";
import { removeImage } from "@/lib/storage";
import { emptyToNull, serviceFormSchema } from "@/lib/validators/site";
import type { ActionState } from "@/lib/actions/profile";

function revalidateServices(id?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/services");
  revalidatePath("/manage/services");
  if (id) {
    revalidatePath(`/services/${id}`);
    revalidatePath(`/manage/services/${id}`);
  }
}

function readServiceForm(formData: FormData) {
  let sections: unknown = [];
  const raw = formData.get("sections");
  if (typeof raw === "string" && raw.trim().length > 0) {
    try {
      sections = JSON.parse(raw) as unknown;
    } catch {
      sections = null;
    }
  }

  return serviceFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priceMin: formData.get("priceMin") ?? "",
    priceMax: formData.get("priceMax") ?? "",
    currencyLabel: formData.get("currencyLabel") ?? "",
    published: formData.get("published") === "on",
    sortOrder: formData.get("sortOrder") ?? "0",
    sections,
  });
}

async function ownedService(serviceId: string) {
  const physician = await currentPhysician();
  if (!physician) {
    return null;
  }
  const service = await prisma.medicalService.findFirst({
    where: { id: serviceId, physicianProfileId: physician.id },
    select: { id: true, imageKey: true },
  });
  if (!service) {
    return null;
  }
  return { physician, service };
}

export async function createService(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const physician = await currentPhysician();
  if (!physician) {
    return { ok: false, error: "اجازه این کار را ندارید." };
  }

  const parsed = readServiceForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است.",
    };
  }

  const created = await prisma.medicalService.create({
    data: {
      physicianProfileId: physician.id,
      title: parsed.data.title,
      description: parsed.data.description,
      priceMin: parsed.data.priceMin,
      priceMax: parsed.data.priceMax,
      currencyLabel: emptyToNull(parsed.data.currencyLabel),
      published: parsed.data.published,
      sortOrder: parsed.data.sortOrder,
      sections: {
        create: parsed.data.sections.map((section, index) => ({
          title: section.title,
          body: section.body,
          sortOrder: index,
        })),
      },
    },
    select: { id: true },
  });

  revalidateServices(created.id);
  redirect(`/manage/services/${created.id}`);
}

export async function updateService(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const serviceId = String(formData.get("id") ?? "");
  const owned = await ownedService(serviceId);
  if (!owned) {
    return { ok: false, error: "اجازه این کار را ندارید." };
  }

  const parsed = readServiceForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.medicalService.update({
      where: { id: owned.service.id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        priceMin: parsed.data.priceMin,
        priceMax: parsed.data.priceMax,
        currencyLabel: emptyToNull(parsed.data.currencyLabel),
        published: parsed.data.published,
        sortOrder: parsed.data.sortOrder,
      },
    });
    await tx.serviceSection.deleteMany({
      where: { serviceId: owned.service.id },
    });
    if (parsed.data.sections.length > 0) {
      await tx.serviceSection.createMany({
        data: parsed.data.sections.map((section, index) => ({
          serviceId: owned.service.id,
          title: section.title,
          body: section.body,
          sortOrder: index,
        })),
      });
    }
  });

  revalidateServices(owned.service.id);
  return { ok: true };
}

export async function deleteService(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const serviceId = String(formData.get("id") ?? "");
  const owned = await ownedService(serviceId);
  if (!owned) {
    return { ok: false, error: "اجازه این کار را ندارید." };
  }

  const requests = await prisma.serviceRequest.count({
    where: { serviceId: owned.service.id },
  });
  if (requests > 0) {
    return {
      ok: false,
      error: "این خدمت درخواست دارد و حذف نمی‌شود. نمایش عمومی را خاموش کنید.",
    };
  }

  try {
    await prisma.medicalService.delete({ where: { id: owned.service.id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return { ok: false, error: "این خدمت را نمی‌توان حذف کرد." };
    }
    throw error;
  }

  if (owned.service.imageKey) {
    const stillUsed = await prisma.medicalService.count({
      where: { imageKey: owned.service.imageKey },
    });
    const photoUsed = await prisma.physicianProfile.count({
      where: { photoKey: owned.service.imageKey },
    });
    if (stillUsed + photoUsed === 0) {
      await removeImage(owned.service.imageKey);
    }
  }

  revalidateServices(owned.service.id);
  redirect("/manage/services");
}
