import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { SiteShell } from "@/components/layout/site-shell";
import { HeroMark } from "@/components/site/hero-mark";
import { ServiceCard } from "@/components/site/service-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

async function Landing() {
  await connection();
  const [profile, services] = await Promise.all([
    prisma.physicianProfile.findFirst({
      select: {
        displayName: true,
        gender: true,
        bio: true,
        photoKey: true,
      },
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
  ]);

  const name = profile?.displayName?.trim() ?? "";
  const gender = profile?.gender?.trim() ?? "";
  const bio = profile?.bio?.trim() ?? "";
  const hasProfile = Boolean(name || gender || bio || profile?.photoKey);

  return (
    <SiteShell className="flex flex-col gap-10">
      <section className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.16fr)_minmax(0,0.84fr)]">
        <div className="flex min-w-0 flex-col items-start gap-4">
          {profile?.photoKey ? (
            <Image
              src={`/media/${profile.photoKey}`}
              alt={name || "تصویر پزشک"}
              width={96}
              height={96}
              unoptimized
              className="size-24 rounded-full object-cover ring-2 ring-border"
            />
          ) : null}
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold text-balance text-foreground">
              {name || "معرفی پزشک"}
            </h1>
            {gender ? <p className="text-sm text-muted-foreground">{gender}</p> : null}
          </div>
          {bio ? (
            <p className="max-w-[65ch] whitespace-pre-wrap text-sm leading-relaxed">{bio}</p>
          ) : !hasProfile ? (
            <p className="text-sm text-muted-foreground">پروفایل عمومی هنوز تکمیل نشده است.</p>
          ) : null}
          <Button asChild size="lg" className="h-10 px-4 text-sm">
            <Link href="/services">مشاهده خدمات</Link>
          </Button>
        </div>
        <HeroMark />
      </section>

      <section id="services" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">خدمات</h2>
          <p className="max-w-[65ch] text-sm text-muted-foreground">
            نوع ویزیت را ببینید و برای هماهنگی، درخواست ثبت کنید.
          </p>
        </div>
        {services.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground">فعلاً خدمتی برای نمایش نیست.</p>
            </CardContent>
          </Card>
        ) : (
          <ul className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <li key={service.id} className="min-w-0">
                <ServiceCard
                  id={service.id}
                  title={service.title}
                  description={service.description}
                  priceMin={service.priceMin}
                  priceMax={service.priceMax}
                  currencyLabel={service.currencyLabel}
                  imageKey={service.imageKey}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>چطور درخواست بدهم</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 max-w-[65ch] text-sm text-muted-foreground">
            نوبت را پزشک هماهنگ می‌کند. ثبت درخواست به‌معنای وقت قطعی نیست.
          </p>
          <ol className="flex list-decimal flex-col gap-2 ps-5 text-sm leading-relaxed">
            <li>خدمت مورد نظر را باز کنید.</li>
            <li>اگر وارد حساب نشده‌اید، وارد شوید.</li>
            <li>توضیح کوتاهی برای پزشک بنویسید و درخواست را ثبت کنید.</li>
            <li>وضعیت درخواست را در «درخواست‌های من» ببینید تا پزشک آن را بپذیرد یا رد کند.</li>
          </ol>
        </CardContent>
      </Card>
    </SiteShell>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <Landing />
    </Suspense>
  );
}
