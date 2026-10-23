import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { SiteShell } from "@/components/layout/site-shell";
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
    <SiteShell className="flex flex-col gap-10">
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
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
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

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">خدمت جدید</h2>
        <ServiceForm action={createService} />
      </section>
    </SiteShell>
  );
}

export default function ManageServicesPage() {
  return (
    <Suspense fallback={null}>
      <ManageServices />
    </Suspense>
  );
}
