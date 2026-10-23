import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { RequestDecision } from "@/components/site/request-decision";
import { StatusBadge } from "@/components/site/status-badge";
import { currentPhysician } from "@/lib/access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

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
      patient: { select: { user: { select: { email: true } } } },
    },
  });

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-10 md:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground">درخواست‌های رزرو</h1>
        <p className="text-sm text-muted-foreground">
          درخواست‌های بیماران برای خدمات شما.
        </p>
      </header>

      {requests.length === 0 ? (
        <Card>
          <CardContent>
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
                  <p className="text-sm text-muted-foreground">
                    <span dir="ltr" lang="en" className="inline-block font-mono text-xs">
                      {request.patient.user.email}
                    </span>
                  </p>
                  <StatusBadge status={request.status} />
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
    </div>
  );
}

export default function RequestsPage() {
  return (
    <Suspense fallback={null}>
      <RequestList />
    </Suspense>
  );
}
