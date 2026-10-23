import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { currentPhysician } from "@/lib/access";
import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/lib/prisma";

async function PatientList() {
  await connection();
  const physician = await currentPhysician();
  if (!physician) {
    redirect("/");
  }

  const relationships = await prisma.careRelationship.findMany({
    where: { physicianProfileId: physician.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      patient: {
        select: {
          user: { select: { email: true } },
        },
      },
    },
  });

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-10 md:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground">بیماران</h1>
        <p className="text-sm text-muted-foreground">
          پس از پذیرش درخواست رزرو، بیمار در این فهرست ظاهر می‌شود.
        </p>
      </header>

      {relationships.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              هنوز بیماری با رابطهٔ مراقبت ثبت نشده است. درخواست‌های پذیرفته‌شده اینجا
              نمایش داده می‌شوند.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {relationships.map((row) => (
            <li key={row.id}>
              <Card className="h-full">
                <CardContent className="flex flex-col gap-1">
                  <span dir="ltr" lang="en" className="font-mono text-sm text-foreground">
                    {row.patient.user.email}
                  </span>
                  <time
                    dateTime={row.createdAt.toISOString()}
                    className="text-xs text-muted-foreground"
                  >
                    از{" "}
                    {row.createdAt.toLocaleDateString("fa-IR", {
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

export default function ManagePatientsPage() {
  return (
    <Suspense fallback={null}>
      <PatientList />
    </Suspense>
  );
}
