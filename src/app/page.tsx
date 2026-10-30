import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { EmptyState } from "@/components/layout/empty-state";
import { SiteLoading, siteShellClass, siteServiceGridClass } from "@/components/layout/site-shell";
import { DemoClinicLocationMap } from "@/components/site/demo-clinic-location-map";
import { HeroMark } from "@/components/site/hero-mark";
import { RequestPathStrip } from "@/components/site/request-path-strip";
import { ReceptionHours } from "@/components/site/reception-hours";
import { ServiceCard } from "@/components/site/service-card";
import { Button } from "@/components/ui/button";
import { loadPublicReceptionWeek } from "@/lib/booking-availability";
import { displayPrices } from "@/lib/money";
import { currentPhysician } from "@/lib/access";
import { findPublicPhysician } from "@/lib/physician-site";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";

async function Landing() {
  await connection();
  const physician = await currentPhysician();
  const [profile, services, receptionDays] = await Promise.all([
    findPublicPhysician({
      displayName: true,
      gender: true,
      bio: true,
      photoKey: true,
    }),
    prisma.medicalService.findMany({
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
    }),
    loadPublicReceptionWeek(),
  ]);

  const name = profile?.displayName?.trim() ?? "";
  const gender = profile?.gender?.trim() ?? "";
  const bio = profile?.bio?.trim() ?? "";
  const hasProfile = Boolean(name || gender || bio || profile?.photoKey);

  return (
    <div className="flex flex-col">
      <section aria-labelledby="physician-heading">
        <div
          className={cn(
            siteShellClass,
            "grid items-start gap-8 py-8 md:gap-10 md:py-10 lg:grid-cols-2 lg:grid-rows-[auto_auto_auto] lg:items-stretch lg:gap-x-12 lg:gap-y-6 lg:py-12",
          )}
        >
          <div className="flex min-w-0 flex-col items-start gap-5 lg:col-start-1 lg:row-start-1 lg:gap-6">
            <div className="flex items-center gap-4">
              {profile?.photoKey ? (
                <Image
                  src={`/media/${profile.photoKey}`}
                  alt={name || "تصویر پزشک"}
                  width={96}
                  height={96}
                  unoptimized
                  className="size-16 shrink-0 rounded-full object-cover ring-2 ring-border shadow-sm sm:size-20"
                />
              ) : null}
              <div className="flex min-w-0 flex-col gap-1.5">
                <h1
                  id="physician-heading"
                  className="text-4xl font-semibold text-balance text-foreground sm:text-5xl"
                >
                  {name || "معرفی پزشک"}
                </h1>
                {gender ? <p className="text-base text-muted-foreground">{gender}</p> : null}
              </div>
            </div>
            {bio ? (
              <p className="max-w-[42rem] whitespace-pre-wrap text-base leading-8 text-foreground">
                {bio}
              </p>
            ) : !hasProfile ? (
              <p className="text-base text-muted-foreground">پروفایل عمومی هنوز تکمیل نشده است.</p>
            ) : null}
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="text-base">
                <Link href={physician ? "/manage/services" : "#services"}>
                  {physician ? "مدیریت خدمات" : "رزرو نوبت"}
                </Link>
              </Button>
              {physician ? null : (
                <Button asChild variant="outline" size="lg" className="bg-card text-base">
                  <Link href="#request-path">چطور درخواست بدهم</Link>
                </Button>
              )}
            </div>
          </div>
          <DemoClinicLocationMap />
          <HeroMark className="hero-mark--fill lg:col-start-2 lg:row-start-1 lg:row-span-2" />
        </div>
      </section>

      {physician ? null : <RequestPathStrip />}

      <section id="services" className="scroll-mt-24 bg-muted/60">
        <div className={cn(siteShellClass, "flex flex-col gap-8 py-14 md:py-16")}>
          <div className="flex max-w-[42rem] flex-col gap-2">
            <h2 className="text-3xl font-semibold">خدمات</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              {physician
                ? "فهرست خدمات منتشرشده در سایت عمومی."
                : "نوع ویزیت را ببینید و برای هماهنگی، درخواست ثبت کنید."}
            </p>
          </div>
          {services.length === 0 ? (
            <EmptyState>فعلاً خدمتی برای نمایش نیست.</EmptyState>
          ) : (
            <ul className={siteServiceGridClass}>
              {services.map((service) => (
                <li key={service.id} className="min-w-0">
                  <ServiceCard
                    id={service.id}
                    title={service.title}
                    description={service.description}
                    {...displayPrices(service)}
                    currencyLabel={service.currencyLabel}
                    imageKey={service.imageKey}
                    physicianView={Boolean(physician)}
                    titleLevel="h3"
                    priority={Boolean(service.imageKey)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="scroll-mt-24">
        <div className={cn(siteShellClass, "py-14 md:py-16")}>
          <ReceptionHours days={receptionDays} />
        </div>
      </section>

      <footer className="bg-footer text-footer-foreground">
        <div
          className={cn(
            siteShellClass,
            "flex flex-col gap-6 py-10 md:flex-row md:items-end md:justify-between",
          )}
        >
          <div className="flex flex-col gap-2">
            <p className="text-lg font-semibold">{name || "مطب"}</p>
            <p className="flex items-center gap-2 text-sm text-footer-muted">
              <span className="sr-only">تلفن مطب</span>
              <a
                href="tel:09110000000"
                dir="ltr"
                lang="en"
                className="focus-ring rounded-sm font-medium text-footer-foreground"
              >
                0911 000 000
              </a>
            </p>
          </div>
          <nav aria-label="پایان صفحه" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a href="#services" className="focus-ring rounded-sm text-footer-muted hover:text-footer-foreground">
              خدمات
            </a>
            <a
              href="#reception-hours"
              className="focus-ring rounded-sm text-footer-muted hover:text-footer-foreground"
            >
              ساعات پذیرش
            </a>
            {physician ? null : (
              <a
                href="#request-path"
                className="focus-ring rounded-sm text-footer-muted hover:text-footer-foreground"
              >
                چطور درخواست بدهم
              </a>
            )}
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<SiteLoading label="در حال بارگذاری…" />}>
      <Landing />
    </Suspense>
  );
}
