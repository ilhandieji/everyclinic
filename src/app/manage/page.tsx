import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { CalendarDays, Inbox, Stethoscope, Users, UserRound } from "lucide-react";
import { currentPhysician } from "@/lib/access";
import { PageHeader } from "@/components/layout/page-header";
import { SiteLoading, SiteShell } from "@/components/layout/site-shell";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const links = [
  {
    href: "/manage/profile",
    title: "پروفایل عمومی",
    description: "نام، معرفی و تصویر صفحهٔ اصلی سایت",
    icon: UserRound,
  },
  {
    href: "/manage/services",
    title: "خدمات",
    description: "افزودن، ویرایش و نمایش خدمات پزشکی",
    icon: Stethoscope,
  },
  {
    href: "/manage/schedule",
    title: "زمان‌بندی",
    description: "روزها و بازه‌های ساعت برای رزرو بیمار",
    icon: CalendarDays,
  },
  {
    href: "/manage/requests",
    title: "درخواست‌های رزرو",
    description: "بررسی و پذیرش یا رد درخواست بیماران",
    icon: Inbox,
  },
  {
    href: "/manage/patients",
    title: "بیماران",
    description: "فهرست بیمارانی که رابطهٔ مراقبت با آن‌ها ثبت شده است",
    icon: Users,
  },
] as const;

async function ManageHub() {
  await connection();
  const physician = await currentPhysician();
  if (!physician) {
    redirect("/");
  }

  return (
    <SiteShell className="flex flex-col gap-6">
      <PageHeader
        title="مدیریت مطب"
        lede="از اینجا بخش‌های مختلف پنل پزشک را باز کنید."
      />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((item) => {
          const Icon = item.icon;
          return (
          <li key={item.href}>
            <Link href={item.href} className="focus-ring block h-full rounded-lg">
              <Card className="h-full transition-colors hover:bg-muted/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon aria-hidden className="size-4 shrink-0 text-primary" />
                    {item.title}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </li>
          );
        })}
      </ul>
    </SiteShell>
  );
}

export default function ManagePage() {
  return (
    <Suspense fallback={<SiteLoading label="در حال بارگذاری مدیریت…" />}>
      <ManageHub />
    </Suspense>
  );
}
