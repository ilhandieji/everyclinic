import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { SiteLoading, SiteShell } from "@/components/layout/site-shell";
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
      <PageHeader
        title="خدمات"
        lede="خدمات منتشرشده در صفحهٔ عمومی «خدمات» دیده می‌شوند."
      />

      {services.length === 0 ? (
        <EmptyState>هنوز خدمتی ثبت نشده است. فرم پایین را پر کنید.</EmptyState>
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
                    <Badge variant={service.published ? "secondary" : "outline"}>
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
        <h2 className="text-lg font-semibold text-foreground">خدمت جدید</h2>
        <ServiceForm action={createService} />
      </section>
    </SiteShell>
  );
}

export default function ManageServicesPage() {
  return (
    <Suspense fallback={<SiteLoading label="در حال بارگذاری خدمات…" />}>
      <ManageServices />
    </Suspense>
  );
}
