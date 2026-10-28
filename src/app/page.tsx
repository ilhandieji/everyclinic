import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { EmptyState } from "@/components/layout/empty-state";
import { SiteLoading, SiteShell, siteServiceGridClass } from "@/components/layout/site-shell";
import { HeroMark } from "@/components/site/hero-mark";
import { JourneyIcon, type JourneyIconName } from "@/components/site/service-icon";
import { ReceptionHours } from "@/components/site/reception-hours";
import { ServiceCard } from "@/components/site/service-card";
import { Button } from "@/components/ui/button";
import { loadPublicReceptionWeek } from "@/lib/booking-availability";
import { displayPrices } from "@/lib/money";
import { currentPhysician } from "@/lib/access";
import { findPublicPhysician } from "@/lib/physician-site";
import prisma from "@/lib/prisma";

const requestSteps: { name: JourneyIconName; text: string }[] = [
  { name: "browse", text: "خدمت مورد نظر را باز کنید." },
  { name: "account", text: "اگر وارد حساب نشده‌اید، وارد شوید." },
  { name: "note", text: "توضیح کوتاهی برای پزشک بنویسید و درخواست را ثبت کنید." },
  {
    name: "status",
    text: "وضعیت درخواست را در «درخواست‌های من» ببینید تا پزشک آن را بپذیرد یا رد کند.",
  },
];

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
    <SiteShell className="flex flex-col gap-10">
      <section className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(16rem,0.88fr)] lg:gap-12">
        <div className="flex min-w-0 flex-col items-start gap-5">
          <div className="flex items-center gap-4">
            {profile?.photoKey ? (
              <Image
                src={`/media/${profile.photoKey}`}
                alt={name || "تصویر پزشک"}
                width={80}
                height={80}
                unoptimized
                className="size-16 shrink-0 rounded-full object-cover ring-2 ring-border sm:size-20"
              />
            ) : null}
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-sm font-medium text-primary">مطب</p>
              <h1 className="text-3xl font-semibold text-balance text-foreground sm:text-4xl">
                {name || "معرفی پزشک"}
              </h1>
              {gender ? <p className="text-sm text-muted-foreground">{gender}</p> : null}
            </div>
          </div>
          {bio ? (
            <p className="max-w-[65ch] border-s-2 border-primary ps-4 whitespace-pre-wrap text-sm leading-relaxed">
              {bio}
            </p>
          ) : !hasProfile ? (
            <p className="text-sm text-muted-foreground">پروفایل عمومی هنوز تکمیل نشده است.</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link href={physician ? "/manage/services" : "/services"}>
                {physician ? "مدیریت خدمات" : "مشاهده خدمات"}
              </Link>
            </Button>
            {physician ? null : (
              <Button asChild variant="outline">
                <Link href="#request-path">چطور درخواست بدهم</Link>
              </Button>
            )}
          </div>
        </div>
        <HeroMark />
      </section>

      <section id="services" className="flex scroll-mt-24 flex-col gap-5">
        <div className="flex max-w-[65ch] flex-col gap-1">
          <h2 className="text-2xl font-semibold">خدمات</h2>
          <p className="text-sm text-muted-foreground">
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
      </section>

      <ReceptionHours days={receptionDays} />

      {physician ? null : (
        <section id="request-path" className="flex scroll-mt-24 flex-col gap-4">
          <div className="max-w-[65ch]">
            <h2 className="text-2xl font-semibold">چطور درخواست بدهم</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              نوبت را پزشک هماهنگ می‌کند. ثبت درخواست به‌معنای وقت قطعی نیست.
            </p>
          </div>
          <ol className="grid list-none gap-4 sm:grid-cols-2">
            {requestSteps.map((step, index) => (
              <li key={step.name} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <span className="service-tile service-tile--calm shrink-0" aria-hidden="true">
                  <JourneyIcon name={step.name} className="size-6" />
                </span>
                <p className="text-sm leading-relaxed">
                  <span className="ms-0 me-1 font-semibold text-primary" aria-hidden="true">
                    {index + 1}.
                  </span>
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </SiteShell>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<SiteLoading label="در حال بارگذاری…" />}>
      <Landing />
    </Suspense>
  );
}
