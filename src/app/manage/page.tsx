import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { currentPhysician } from "@/lib/access";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const links = [
  {
    href: "/manage/profile",
    title: "پروفایل عمومی",
    description: "نام، معرفی و تصویر صفحهٔ اصلی سایت",
  },
  {
    href: "/manage/services",
    title: "خدمات",
    description: "افزودن، ویرایش و نمایش خدمات پزشکی",
  },
  {
    href: "/manage/requests",
    title: "درخواست‌های رزرو",
    description: "بررسی و پذیرش یا رد درخواست بیماران",
  },
  {
    href: "/manage/patients",
    title: "بیماران",
    description: "فهرست بیمارانی که رابطهٔ مراقبت با آن‌ها ثبت شده است",
  },
] as const;

async function ManageHub() {
  await connection();
  const physician = await currentPhysician();
  if (!physician) {
    redirect("/");
  }

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-10 md:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground">مدیریت مطب</h1>
        <p className="text-sm text-muted-foreground">
          از اینجا بخش‌های مختلف پنل پزشک را باز کنید.
        </p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="block h-full">
              <Card className="h-full transition-colors hover:bg-card/80">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ManagePage() {
  return (
    <Suspense fallback={null}>
      <ManageHub />
    </Suspense>
  );
}
