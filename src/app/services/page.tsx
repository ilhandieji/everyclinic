import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { PriceText } from "@/components/site/price-text";
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
    return null;
  }

  return (
    <ul className="mx-auto grid w-full max-w-5xl gap-4 px-4 py-10 sm:grid-cols-2">
      {services.map((service) => (
        <li key={service.id} className="border border-border bg-card/70">
          <Link href={`/services/${service.id}`} className="flex h-full flex-col gap-3 p-4">
            {service.imageKey ? (
              <Image
                src={`/media/${service.imageKey}`}
                alt={service.title}
                width={800}
                height={320}
                unoptimized
                className="h-40 w-full object-cover"
              />
            ) : null}
            <h2 className="text-base font-semibold">{service.title}</h2>
            {service.description ? (
              <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
                {service.description}
              </p>
            ) : null}
            <PriceText
              min={service.priceMin}
              max={service.priceMax}
              label={service.currencyLabel}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={null}>
      <ServiceList />
    </Suspense>
  );
}
