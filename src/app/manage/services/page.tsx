import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { ServiceForm } from "@/components/site/service-form";
import { createService } from "@/lib/actions/services";
import { currentPhysician } from "@/lib/access";
import { surfaceCardClass } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
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
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground">خدمات</h1>
        <p className="text-sm text-muted-foreground">
          خدمات منتشرشده در صفحهٔ عمومی «خدمات» دیده می‌شوند.
        </p>
      </header>

      {services.length === 0 ? (
        <p className={cn(surfaceCardClass, "p-4 text-sm text-muted-foreground")}>
          هنوز خدمتی ثبت نشده است.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {services.map((service) => (
            <li key={service.id}>
              <Link
                href={`/manage/services/${service.id}`}
                className={cn(
                  surfaceCardClass,
                  "flex h-full flex-col gap-1 p-4 transition-colors hover:bg-card/90",
                )}
              >
                <span className="text-sm font-semibold text-foreground">{service.title}</span>
                <span className="text-xs text-muted-foreground">
                  {service.published ? "نمایش در سایت" : "پنهان"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <section className={cn(surfaceCardClass, "flex flex-col gap-4 p-5")}>
        <h2 className="text-base font-semibold">خدمت جدید</h2>
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
