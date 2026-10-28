import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { SiteLoading, SiteShell } from "@/components/layout/site-shell";
import { PriceText } from "@/components/site/price-text";
import { ServiceVisual } from "@/components/site/service-icon";
import { RequestPanel } from "@/components/site/request-panel";
import { currentPatient, currentPhysician, currentUser } from "@/lib/access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadOpenAvailability } from "@/lib/booking-availability";
import { displayPrices } from "@/lib/money";
import prisma from "@/lib/prisma";

async function ServiceDetail({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const [service, user, physician, patient] = await Promise.all([
    prisma.medicalService.findUnique({
      where: { id },
      include: {
        sections: { orderBy: { sortOrder: "asc" } },
      },
    }),
    currentUser(),
    currentPhysician(),
    currentPatient(),
  ]);

  if (!service) {
    notFound();
  }

  const owns = physician?.id === service.physicianProfileId;
  if (physician) {
    redirect(`/manage/services/${service.id}`);
  }

  if (!service.published && !owns) {
    notFound();
  }

  const mine = patient
    ? await prisma.serviceRequest.findFirst({
        where: { patientProfileId: patient.id, serviceId: service.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, status: true },
      })
    : null;
  const prices = displayPrices(service);
  const days = owns || physician ? [] : await loadOpenAvailability();

  return (
    <SiteShell>
      <article className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(14rem,0.75fr)]">
        <div className="lg:col-start-2 lg:row-start-1">
          <ServiceVisual title={service.title} imageKey={service.imageKey} layout="detail" priority />
        </div>
        <div className="flex min-w-0 flex-col gap-6 lg:col-start-1 lg:row-start-1">
          <h1 className="text-2xl font-semibold text-balance sm:text-3xl">{service.title}</h1>
          {service.description ? (
            <p className="max-w-[65ch] whitespace-pre-wrap text-sm leading-relaxed">{service.description}</p>
          ) : null}
          <PriceText
            min={prices.priceMin}
            max={prices.priceMax}
            label={service.currencyLabel}
          />
          {service.sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{section.body}</p>
              </CardContent>
            </Card>
          ))}
          {owns || physician ? null : (
            <RequestPanel
              serviceId={service.id}
              signedIn={Boolean(user && patient && !physician)}
              request={mine}
              days={days}
            />
          )}
        </div>
      </article>
    </SiteShell>
  );
}

export default function ServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<SiteLoading label="در حال بارگذاری خدمت…" />}>
      <ServiceDetail params={params} />
    </Suspense>
  );
}
