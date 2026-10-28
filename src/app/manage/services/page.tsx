import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { SiteLoading, SiteShell, siteFormClass } from "@/components/layout/site-shell";
import { ServiceForm } from "@/components/site/service-form";
import { createService } from "@/lib/actions/services";
import { currentPhysician } from "@/lib/access";
import { Badge } from "@/components/ui/badge";
import { ServiceIcon, serviceTileClass } from "@/components/site/service-icon";
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

  const form = (
    <section className="flex min-w-0 flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">خدمت جدید</h2>
      <ServiceForm action={createService} />
    </section>
  );

  return (
    <SiteShell className="flex flex-col gap-8">
      <PageHeader
        title="خدمات"
        lede="خدمات منتشرشده در صفحهٔ عمومی «خدمات» دیده می‌شوند."
      />

      {services.length === 0 ? (
        <div className={`flex flex-col gap-6 ${siteFormClass}`}>
          <EmptyState>هنوز خدمتی ثبت نشده است. فرم پایین را پر کنید.</EmptyState>
          {form}
        </div>
      ) : (
        <div className="grid gap-8 xl:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)] xl:items-start">
          <ul className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            {services.map((service) => (
              <li key={service.id} className="border-b border-border last:border-b-0">
                <Link
                  href={`/manage/services/${service.id}`}
                  className="focus-ring flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/60"
                >
                  <span className={`service-tile size-9 shrink-0 ${serviceTileClass(service.title)}`}>
                    <ServiceIcon title={service.title} className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium leading-snug">
                    {service.title}
                  </span>
                  <Badge variant={service.published ? "secondary" : "outline"}>
                    {service.published ? "نمایش در سایت" : "پنهان"}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
          <div className={`min-w-0 ${siteFormClass} xl:mx-0`}>{form}</div>
        </div>
      )}
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
