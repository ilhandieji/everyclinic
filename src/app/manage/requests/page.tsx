import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { SiteLoading, SiteShell } from "@/components/layout/site-shell";
import { RequestDecision } from "@/components/site/request-decision";
import { StatusBadge } from "@/components/site/status-badge";
import { currentPhysician } from "@/lib/access";
import { PatientNameLink } from "@/components/site/patient-name-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExactVisitForm } from "@/components/site/exact-visit-form";
import prisma from "@/lib/prisma";
import { formatFaClock, formatFaDate, formatFaDateTime, parseTehranDateTime, utcDateToCivil } from "@/lib/tehran";

async function RequestList() {
  await connection();
  const physician = await currentPhysician();
  if (!physician) {
    redirect("/");
  }

  const requests = await prisma.serviceRequest.findMany({
    where: { service: { physicianProfileId: physician.id } },
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
      service: { select: { title: true } },
      patient: {
        select: {
          id: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  return (
    <SiteShell className="flex flex-col gap-6">
      <PageHeader
        title="درخواست‌های رزرو"
        lede="درخواست‌های بیماران برای خدمات شما."
      />

      {requests.length === 0 ? (
        <EmptyState
          action={
            <Button asChild variant="outline">
              <Link href="/manage/schedule">زمان‌بندی پذیرش</Link>
            </Button>
          }
       >
          درخواستی نیست. اگر هنوز ساعتی نگذاشته‌اید، اول بازهٔ پذیرش را مشخص کنید.
        </EmptyState>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {requests.map((request) => (
            <li key={request.id}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="min-w-0 text-base">{request.service.title}</CardTitle>
                    <StatusBadge status={request.status} />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <PatientNameLink
                    href={`/manage/patients/${request.patient.id}`}
                    name={request.patient.user.name}
                  />
                  <time
                    dateTime={request.createdAt.toISOString()}
                    className="text-xs text-muted-foreground"
                 >
                    ارسال: {formatFaDateTime(request.createdAt)}
                  </time>
                  {request.note ? (
                    <p className="whitespace-pre-wrap text-sm">{request.note}</p>
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
                  {request.status === "pending" ? <RequestDecision id={request.id} /> : null}
                  {request.status === "accepted" &&
                  request.bookingWindow &&
                  !request.exactVisitAt ? (
                    <ExactVisitForm
                      id={request.id}
                      windowLabel={`${formatFaClock(request.bookingWindow.startTime)} تا ${formatFaClock(request.bookingWindow.endTime)}`}
                    />
                  ) : null}
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
      <RequestList />
    </Suspense>
  );
}
