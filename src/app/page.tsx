import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { PriceText } from "@/components/site/price-text";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      },
    }),
  ]);

  const name = profile?.displayName?.trim() ?? "";
  const gender = profile?.gender?.trim() ?? "";
  const bio = profile?.bio?.trim() ?? "";
  const hasProfile = Boolean(name || gender || bio || profile?.photoKey);

  return (
    <div className="flex w-full flex-col gap-8 px-4 py-10 md:px-8">
      {hasProfile ? (
        <Card className="max-w-3xl">
          <CardHeader className="items-center text-center sm:flex-row sm:items-start sm:text-start">
            {profile?.photoKey ? (
              <Image
                src={`/media/${profile.photoKey}`}
                alt={name || "تصویر پزشک"}
                width={112}
                height={112}
                unoptimized
                className="size-28 rounded-full object-cover ring-2 ring-border/60"
              />
            ) : null}
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl">{name || "معرفی پزشک"}</CardTitle>
              {gender ? <CardDescription>{gender}</CardDescription> : null}
            </div>
          </CardHeader>
          {bio ? (
            <CardContent>
              <p className="max-w-prose whitespace-pre-wrap text-sm leading-relaxed">{bio}</p>
            </CardContent>
          ) : null}
        </Card>
      ) : (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>معرفی پزشک</CardTitle>
            <CardDescription>پروفایل عمومی هنوز تکمیل نشده است.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">خدمات</h2>
          <p className="max-w-prose text-sm text-muted-foreground">
            نوع ویزیت را ببینید و برای هماهنگی، درخواست ثبت کنید.
          </p>
        </div>
        {services.length === 0 ? (
          <Card className="max-w-3xl">
            <CardContent>
              <p className="text-sm text-muted-foreground">فعلاً خدمتی برای نمایش نیست.</p>
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <li key={service.id}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {service.description ? (
                      <p className="line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    ) : null}
                    <PriceText
                      min={service.priceMin}
                      max={service.priceMax}
                      label={service.currencyLabel}
                    />
                    <Link
                      href={`/services/${service.id}`}
                      className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      جزئیات و درخواست
                    </Link>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>چطور درخواست بدهم</CardTitle>
          <CardDescription>نوبت را پزشک هماهنگ می‌کند. ثبت درخواست به‌معنای وقت قطعی نیست.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="flex list-decimal flex-col gap-2 ps-5 text-sm leading-relaxed">
            <li>خدمت مورد نظر را باز کنید.</li>
            <li>اگر وارد حساب نشده‌اید، وارد شوید.</li>
            <li>توضیح کوتاهی برای پزشک بنویسید و درخواست را ثبت کنید.</li>
            <li>وضعیت درخواست را در «درخواست‌های من» ببینید تا پزشک آن را بپذیرد یا رد کند.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <Landing />
    </Suspense>
  );
}
