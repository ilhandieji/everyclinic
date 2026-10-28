"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";
import { currentPhysician } from "@/lib/access";
import { civilRange, windowsOverlap } from "@/lib/booking-windows";
import prisma from "@/lib/prisma";
import type { ActionState } from "@/lib/actions/state";
import { civilToUtcDate } from "@/lib/tehran";
import {
  addBookingWindowSchema,
  bookingDayClosedSchema,
  bookingWindowIdSchema,
  copyBookingWindowsSchema,
} from "@/lib/validators/booking";

function revalidateSchedule() {
  revalidatePath("/");
  revalidatePath("/manage/schedule");
  revalidatePath("/manage/requests");
  revalidatePath("/services");
}

async function requirePhysician() {
  return currentPhysician();
}

export async function addBookingWindow(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const physician = await requirePhysician();
  if (!physician) {
    return { ok: false, error: "اجازه این کار را ندارید." };
  }
  const parsed = addBookingWindowSchema.safeParse({
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است.",
    };
  }
  const date = civilToUtcDate(parsed.data.date);
  if (!date) {
    return { ok: false, error: "تاریخ نامعتبر است." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const day = await tx.bookingDay.upsert({
        where: {
          physicianProfileId_date: {
            physicianProfileId: physician.id,
            date,
          },
        },
        create: {
          physicianProfileId: physician.id,
          date,
        },
        update: {},
        select: {
          id: true,
          windows: { select: { startTime: true, endTime: true } },
        },
      });
      const next = {
        startTime: parsed.data.startTime,
        endTime: parsed.data.endTime,
      };
      if (day.windows.some((existing) => windowsOverlap(existing, next))) {
        throw new Error("overlap");
      }
      await tx.bookingWindow.create({
        data: {
          bookingDayId: day.id,
          startTime: next.startTime,
          endTime: next.endTime,
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "overlap") {
      return { ok: false, error: "این بازه با بازهٔ دیگری در همین روز هم‌پوشانی دارد." };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "این بازه از قبل ثبت شده است." };
    }
    console.error("add booking window failed");
    return { ok: false, error: "بازه ثبت نشد." };
  }

  revalidateSchedule();
  return { ok: true };
}

export async function setBookingDayClosed(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const physician = await requirePhysician();
  if (!physician) {
    return { ok: false, error: "اجازه این کار را ندارید." };
  }
  const closedRaw = formData.get("closed");
  const parsed = bookingDayClosedSchema.safeParse({
    date: formData.get("date"),
    closed: closedRaw === "true" || closedRaw === "on",
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است.",
    };
  }
  const date = civilToUtcDate(parsed.data.date);
  if (!date) {
    return { ok: false, error: "تاریخ نامعتبر است." };
  }

  try {
    await prisma.bookingDay.upsert({
      where: {
        physicianProfileId_date: {
          physicianProfileId: physician.id,
          date,
        },
      },
      create: {
        physicianProfileId: physician.id,
        date,
        closed: parsed.data.closed,
      },
      update: { closed: parsed.data.closed },
    });
  } catch {
    console.error("set booking day closed failed");
    return { ok: false, error: "وضعیت روز ثبت نشد." };
  }

  revalidateSchedule();
  return { ok: true };
}

export async function removeBookingWindow(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const physician = await requirePhysician();
  if (!physician) {
    return { ok: false, error: "اجازه این کار را ندارید." };
  }
  const parsed = bookingWindowIdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) {
    return { ok: false, error: "بازه نامعتبر است." };
  }

  try {
    const window = await prisma.bookingWindow.findFirst({
      where: {
        id: parsed.data.id,
        day: { physicianProfileId: physician.id },
      },
      select: { id: true, request: { select: { id: true } } },
    });
    if (!window) {
      return { ok: false, error: "بازه پیدا نشد." };
    }
    if (window.request) {
      return { ok: false, error: "این بازه رزرو شده و قابل حذف نیست." };
    }
    await prisma.bookingWindow.delete({ where: { id: window.id } });
  } catch {
    console.error("remove booking window failed");
    return { ok: false, error: "بازه حذف نشد." };
  }

  revalidateSchedule();
  return { ok: true };
}

export async function copyBookingWindows(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const physician = await requirePhysician();
  if (!physician) {
    return { ok: false, error: "اجازه این کار را ندارید." };
  }
  const parsed = copyBookingWindowsSchema.safeParse({
    sourceDate: formData.get("sourceDate"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است.",
    };
  }
  const sourceDate = civilToUtcDate(parsed.data.sourceDate);
  if (!sourceDate) {
    return { ok: false, error: "تاریخ این روز نامعتبر است." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const source = await tx.bookingDay.findUnique({
        where: {
          physicianProfileId_date: {
            physicianProfileId: physician.id,
            date: sourceDate,
          },
        },
        select: {
          windows: { select: { startTime: true, endTime: true } },
        },
      });
      if (!source || source.windows.length === 0) {
        throw new Error("empty-source");
      }
      const template = source.windows;
      for (const civil of civilRange(parsed.data.startDate, parsed.data.endDate)) {
        const date = civilToUtcDate(civil);
        if (!date) {
          continue;
        }
        const day = await tx.bookingDay.upsert({
          where: {
            physicianProfileId_date: {
              physicianProfileId: physician.id,
              date,
            },
          },
          create: {
            physicianProfileId: physician.id,
            date,
          },
          update: {},
          select: {
            id: true,
            windows: {
              select: {
                id: true,
                startTime: true,
                endTime: true,
                request: { select: { id: true } },
              },
            },
          },
        });
        const reserved = day.windows.filter((window) => window.request !== null);
        for (const window of day.windows) {
          if (!window.request) {
            await tx.bookingWindow.delete({ where: { id: window.id } });
          }
        }
        for (const next of template) {
          const clashesReserved = reserved.some((existing) =>
            windowsOverlap(existing, next),
          );
          if (clashesReserved) {
            continue;
          }
          await tx.bookingWindow.create({
            data: {
              bookingDayId: day.id,
              startTime: next.startTime,
              endTime: next.endTime,
            },
          });
        }
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "empty-source") {
      return { ok: false, error: "برای این روز هنوز ساعتی ثبت نشده است." };
    }
    console.error("copy booking windows failed");
    return { ok: false, error: "کپی بازه‌ها انجام نشد." };
  }

  revalidateSchedule();
  return { ok: true };
}
