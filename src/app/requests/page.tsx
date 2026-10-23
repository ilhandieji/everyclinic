import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { currentPatient } from "@/lib/access";
import { surfaceCardClass } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";

const statusLabel = {
  pending: "در انتظار",
  accepted: "پذیرفته‌شده",
  declined: "رد شده",
  cancelled: "لغو شده",
} as const;

async function MyRequests() {
  await connection();
  const patient = await currentPatient();
  if (!patient) {
    redirect("/");
  }

  const requests = await prisma.serviceRequest.findMany({
    where: { patientProfileId: patient.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      note: true,
      status: true,
      createdAt: true,
      service: { select: { id: true, title: true } },
    },
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground">درخواست‌های من</h1>
        <p className="text-sm text-muted-foreground">
          وضعیت درخواست‌های رزرو خدمت را اینجا ببینید.
        </p>
      </header>

      {requests.length === 0 ? (
        <div className={cn(surfaceCardClass, "flex flex-col gap-3 p-4")}>
          <p className="text-sm text-muted-foreground">هنوز درخواستی ثبت نکرده‌اید.</p>
          <Link href="/services" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            مشاهدهٔ خدمات
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {requests.map((request) => (
            <li key={request.id} className={cn(surfaceCardClass, "flex flex-col gap-2 p-4")}>
              <Link
                href={`/services/${request.service.id}`}
                className="text-sm font-semibold text-foreground hover:underline"
              >
                {request.service.title}
              </Link>
              <p className="text-xs text-muted-foreground">{statusLabel[request.status]}</p>
              {request.note ? (
                <p className="whitespace-pre-wrap text-sm text-foreground">{request.note}</p>
              ) : null}
              <time
                dateTime={request.createdAt.toISOString()}
                className="text-xs text-muted-foreground"
              >
                {request.createdAt.toLocaleDateString("fa-IR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function RequestsPage() {
  return (
    <Suspense fallback={null}>
      <MyRequests />
    </Suspense>
  );
}
