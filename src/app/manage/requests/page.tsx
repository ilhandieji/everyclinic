import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { RequestDecision } from "@/components/site/request-decision";
import { StatusBadge } from "@/components/site/status-badge";
import { currentPhysician } from "@/lib/access";
import { PatientNameLink } from "@/components/site/patient-name-link";
import { SiteShell, sitePanelClass, siteProseClass } from "@/components/layout/site-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { formatFaDateTime } from "@/lib/tehran";

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
      <header className={`${siteProseClass} flex flex-col gap-1`}>
        <h1 className="text-lg font-semibold text-foreground">درخواست‌های رزرو</h1>
        <p className="text-sm text-muted-foreground">
          درخواست‌های بیماران برای خدمات شما.
        </p>
      </header>

      {requests.length === 0 ? (
        <Card className={sitePanelClass}>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">درخواستی نیست.</p>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {requests.map((request) => (
            <li key={request.id}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>{request.service.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <PatientNameLink
                    href={`/manage/patients/${request.patient.id}`}
                    name={request.patient.user.name}
                  />
                  <StatusBadge status={request.status} />
                  <time
                    dateTime={request.createdAt.toISOString()}
                    className="text-xs text-muted-foreground"
                  >
                    ارسال: {formatFaDateTime(request.createdAt)}
                  </time>
                  {request.note ? (
                    <p className="whitespace-pre-wrap text-sm">{request.note}</p>
                  ) : null}
                  {request.status === "pending" ? <RequestDecision id={request.id} /> : null}
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
      <RequestList />
    </Suspense>
  );
}
