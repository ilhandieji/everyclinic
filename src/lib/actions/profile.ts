"use server";

import { revalidatePath } from "next/cache";
import { currentPhysician } from "@/lib/access";
import prisma from "@/lib/prisma";
import { emptyToNull, profileFormSchema } from "@/lib/validators/site";

export type ActionState = { ok: true } | { ok: false; error: string } | null;

export async function saveProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const physician = await currentPhysician();
  if (!physician) {
    return { ok: false, error: "اجازه این کار را ندارید." };
  }

  const parsed = profileFormSchema.safeParse({
    displayName: formData.get("displayName"),
    gender: formData.get("gender"),
    bio: formData.get("bio"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است.",
    };
  }

  await prisma.physicianProfile.update({
    where: { id: physician.id },
    data: {
      displayName: emptyToNull(parsed.data.displayName),
      gender: emptyToNull(parsed.data.gender),
      bio: emptyToNull(parsed.data.bio),
    },
  });

  revalidatePath("/", "layout");
  return { ok: true };
}
