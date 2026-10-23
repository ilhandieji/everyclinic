import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { PriceText } from "@/components/site/price-text";
import { RequestPanel } from "@/components/site/request-panel";
import { currentPatient, currentPhysician, currentUser } from "@/lib/access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

async function ServiceDetail({ id }: { id: string }) {
  await connection();
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

  return (
    <article className="flex w-full flex-col gap-6 px-4 py-10 md:px-8">
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
        min={service.priceMin}
        max={service.priceMax}
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
      {owns ? null : (
        <RequestPanel
          serviceId={service.id}
          signedIn={Boolean(user && patient)}
          request={mine}
        />
      )}
    </article>
  );
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <ServiceDetail id={id} />
    </Suspense>
  );
}
