import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { ServiceForm } from "@/components/site/service-form";
import { createService } from "@/lib/actions/services";
import { currentPhysician } from "@/lib/access";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

async function ManageServices() {
  await connection();
  const physician = await currentPhysician();
  if (!physician) {
    redirect("/");
  }

  const services = await prisma.medicalService.findMany({
    where: { physicianProfileId: physician.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, title: true, published: true },
  });

  return (
    <div className="flex w-full flex-col gap-10 px-4 py-10 md:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground">خدمات</h1>
        <p className="text-sm text-muted-foreground">
          خدمات منتشرشده در صفحهٔ عمومی «خدمات» دیده می‌شوند.
        </p>
      </header>

      {services.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">هنوز خدمتی ثبت نشده است.</p>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => (
            <li key={service.id}>
              <Link href={`/manage/services/${service.id}`} className="block h-full">
                <Card className="h-full transition-colors hover:bg-card/80">
                  <CardHeader>
                    <CardTitle>{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={service.published ? "default" : "secondary"}>
                      {service.published ? "نمایش در سایت" : "پنهان"}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>خدمت جدید</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceForm action={createService} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function ManageServicesPage() {
  return (
    <Suspense fallback={null}>
      <ManageServices />
    </Suspense>
  );
}
