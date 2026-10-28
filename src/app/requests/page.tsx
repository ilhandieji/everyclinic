import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { SiteLoading, SiteShell } from "@/components/layout/site-shell";
import { CancelRequestForm } from "@/components/site/cancel-request-form";
import { StatusBadge } from "@/components/site/status-badge";
import { currentPatient, currentPhysician } from "@/lib/access";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <PageHeader
        title="درخواست‌های من"
        lede="وضعیت درخواست‌های رزرو خدمت را اینجا ببینید."
      />

      {requests.length === 0 ? (
        <EmptyState
          action={
            <Button asChild>
              <Link href="/services">مشاهدهٔ خدمات</Link>
            </Button>
          }
       >
          هنوز درخواستی ثبت نکرده‌اید.
        </EmptyState>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {requests.map((request) => (
            <li key={request.id}>
              <Card className="h-full">
                <CardHeader>
                  {request.service.published ? (
                    <CardTitle>
                      <Link href={`/services/${request.service.id}`} className="hover:underline">
                        {request.service.title}
                      </Link>
                    </CardTitle>
                  ) : (
                    <CardTitle>{request.service.title}</CardTitle>
                  )}
                  <StatusBadge status={request.status} />
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
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
                  {request.status === "pending" ? <CancelRequestForm id={request.id} /> : null}
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
    <Suspense fallback={<SiteLoading label="در حال بارگذاری درخواست‌ها…" />}>
      <MyRequests />
    </Suspense>
  );
}
