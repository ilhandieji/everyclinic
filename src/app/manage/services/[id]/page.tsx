import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { PageHeader } from "@/components/layout/page-header";
import { SiteLoading, SiteShell } from "@/components/layout/site-shell";
import { ServiceForm } from "@/components/site/service-form";
import { ServiceIcon, serviceTileClass } from "@/components/site/service-icon";
import { updateService } from "@/lib/actions/services";
import { currentPhysician } from "@/lib/access";
import { displayPrices } from "@/lib/money";
import prisma from "@/lib/prisma";

async function EditService({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const physician = await currentPhysician();
  if (!physician) {
    redirect("/");
  }

  const service = await prisma.medicalService.findFirst({
    where: { id, physicianProfileId: physician.id },
    include: { sections: { orderBy: { sortOrder: "asc" } } },
  });
  if (!service) {
    notFound();
  }

  return (
    <SiteShell className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <span className={`service-tile mt-0.5 ${serviceTileClass(service.title)}`}>
          <ServiceIcon title={service.title} className="size-6" />
        </span>
        <PageHeader title="ویرایش خدمت" lede={service.title} />
      </div>
      <ServiceForm
        action={updateService}
        service={{
          id: service.id,
          title: service.title,
          description: service.description,
          ...displayPrices(service),
          currencyLabel: service.currencyLabel,
          published: service.published,
          sortOrder: service.sortOrder,
          imageKey: service.imageKey,
          sections: service.sections.map((section) => ({
            title: section.title,
            body: section.body,
          })),
        }}
      />
    </SiteShell>
  );
}

export default function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<SiteLoading label="در حال بارگذاری خدمت…" />}>
      <EditService params={params} />
    </Suspense>
  );
}
