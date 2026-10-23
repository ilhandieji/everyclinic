import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { StatusBadge } from "@/components/site/status-badge";
import { currentPatient } from "@/lib/access";
import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/lib/prisma";

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
    <div className="flex w-full flex-col gap-6 px-4 py-10 md:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground">درخواست‌های من</h1>
        <p className="text-sm text-muted-foreground">
          وضعیت درخواست‌های رزرو خدمت را اینجا ببینید.
        </p>
      </header>

      {requests.length === 0 ? (
        <Card className="max-w-xl">
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">هنوز درخواستی ثبت نکرده‌اید.</p>
            <Link href="/services" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
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
                  <Link
                    href={`/services/${request.service.id}`}
                    className="text-sm font-semibold text-foreground hover:underline"
                  >
                    {request.service.title}
                  </Link>
                  <StatusBadge status={request.status} />
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
      <MyRequests />
    </Suspense>
  );
}
