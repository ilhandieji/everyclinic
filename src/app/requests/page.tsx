import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { CancelRequestForm } from "@/components/site/cancel-request-form";
import { StatusBadge } from "@/components/site/status-badge";
import { currentPatient, currentPhysician } from "@/lib/access";
import { SiteShell, sitePanelClass, siteProseClass } from "@/components/layout/site-shell";
import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { formatFaClock, formatFaDate, formatFaDateTime, parseTehranDateTime, utcDateToCivil } from "@/lib/tehran";

async function MyRequests() {
  await connection();
  const physician = await currentPhysician();
  if (physician) {
    redirect("/manage/requests");
  }
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
      exactVisitAt: true,
      bookingWindow: {
        select: {
          startTime: true,
          endTime: true,
          day: { select: { date: true } },
        },
      },
      service: { select: { id: true, title: true, published: true } },
    },
  });

  return (
    <SiteShell className="flex flex-col gap-6">
      <header className={`${siteProseClass} flex flex-col gap-1`}>
        <h1 className="text-lg font-semibold text-foreground">درخواست‌های من</h1>
        <p className="text-sm text-muted-foreground">
          وضعیت درخواست‌های رزرو خدمت را اینجا ببینید.
        </p>
      </header>

      {requests.length === 0 ? (
        <Card className={sitePanelClass}>
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">هنوز درخواستی ثبت نکرده‌اید.</p>
            <Link href="/services" className="text-sm font-medium text-foreground underline-offset-4 hover:underline">
              مشاهدهٔ خدمات
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {requests.map((request) => (
            <li key={request.id}>
              <Card className="h-full">
                <CardContent className="flex flex-col gap-2">
                  {request.service.published ? (
                    <Link
                      href={`/services/${request.service.id}`}
                      className="text-sm font-semibold text-foreground hover:underline"
                    >
                      {request.service.title}
                    </Link>
                  ) : (
                    <p className="text-sm font-semibold text-foreground">{request.service.title}</p>
                  )}
                  <StatusBadge status={request.status} />
                  {request.status === "pending" ? <CancelRequestForm id={request.id} /> : null}
                  {request.note ? (
                    <p className="whitespace-pre-wrap text-sm text-foreground">{request.note}</p>
                  ) : null}
                  {request.bookingWindow ? (
                    <p className="text-sm text-muted-foreground">
                      بازه:{" "}
                      {formatFaDate(
                        parseTehranDateTime(
                          utcDateToCivil(request.bookingWindow.day.date),
                          "00:00",
                        ) ?? request.bookingWindow.day.date,
                      )}
                      {"، "}
                      <span dir="ltr" lang="en">
                        {formatFaClock(request.bookingWindow.startTime)} تا{" "}
                        {formatFaClock(request.bookingWindow.endTime)}
                      </span>
                    </p>
                  ) : null}
                  {request.exactVisitAt ? (
                    <p className="text-sm">
                      ساعت ویزیت: {formatFaDateTime(request.exactVisitAt)}
                    </p>
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
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </SiteShell>
  );
}

export default function RequestsPage() {
  return (
    <Suspense fallback={null}>
      <MyRequests />
    </Suspense>
  );
}
