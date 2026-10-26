import { Suspense } from "react";
import { connection } from "next/server";
import { SiteShell } from "@/components/layout/site-shell";
import { ServiceCard } from "@/components/site/service-card";
import { displayPrices } from "@/lib/money";
import prisma from "@/lib/prisma";

async function ServiceList() {
  await connection();
  const services = await prisma.medicalService.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      description: true,
      priceMin: true,
      priceMax: true,
      currencyLabel: true,
      imageKey: true,
    },
  });

  if (services.length === 0) {
    return (
      <SiteShell>
        <p className="text-sm text-muted-foreground">فعلاً خدمتی برای نمایش نیست.</p>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <ul className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <li key={service.id} className="min-w-0">
            <ServiceCard
              id={service.id}
              title={service.title}
              description={service.description}
              {...displayPrices(service)}
              currencyLabel={service.currencyLabel}
              imageKey={service.imageKey}
            />
          </li>
        ))}
      </ul>
    </SiteShell>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={null}>
      <ServiceList />
    </Suspense>
  );
}
