import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { ServiceForm } from "@/components/site/service-form";
import { createService } from "@/lib/actions/services";
import { currentPhysician } from "@/lib/access";
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-10">
      <ul className="flex flex-col gap-2">
        {services.map((service) => (
          <li key={service.id}>
            <Link href={`/manage/services/${service.id}`} className="text-sm underline">
              {service.title}
              {service.published ? "" : " (پنهان)"}
            </Link>
          </li>
        ))}
      </ul>
      <section className="flex flex-col gap-4">
        <h1 className="text-lg font-semibold">خدمت جدید</h1>
        <ServiceForm action={createService} />
      </section>
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
