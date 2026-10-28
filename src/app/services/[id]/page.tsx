import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { SiteLoading, SiteShell } from "@/components/layout/site-shell";
import { PriceText } from "@/components/site/price-text";
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
    <article className="flex w-full flex-col gap-6">
      {service.imageKey ? (
        <Image
          src={`/media/${service.imageKey}`}
          alt={service.title}
          width={960}
          height={448}
          unoptimized
          className="h-56 w-full object-cover"
        />
      ) : null}
      <h1 className="text-2xl font-semibold">{service.title}</h1>
      {service.description ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{service.description}</p>
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
