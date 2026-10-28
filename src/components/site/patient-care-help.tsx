import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function HelpList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1.5 ps-5 text-sm text-muted-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function CareFirstVisitWelcome() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-border bg-card p-4 text-start shadow-sm">
      <p className="text-sm font-medium text-foreground">پرونده هنوز خالی است؛ این طبیعی است.</p>
      <p className="text-sm text-muted-foreground">
        سوابق، یادآوری پیگیری و نسخه وقتی ظاهر می‌شوند که درخواست رزرو بدهید یا
        پزشک چیزی در پرونده ثبت کند. برای شروع، خدمات مطب را ببینید.
      </p>
      <div className="flex flex-row flex-wrap items-center gap-3">
        <Button asChild className="h-11">
          <Link href="/services">مشاهدهٔ خدمات و درخواست رزرو</Link>
        </Button>
        <Link
          href="/requests"
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          درخواست‌های من
        </Link>
      </div>
    </div>
  );
}

export function CareRecordGuide() {
  return (
    <details
      className="group rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-sm"
    >
      <summary className="cursor-pointer font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
        راهنمای پرونده پزشکی
      </summary>
      <div className="mt-3 hidden space-y-3 text-muted-foreground group-open:block">
        <p>
          این صفحه خلاصهٔ سوابق مراقبت شما در همین مطب است. خالی بودن بخش‌ها تا
          پیش از ثبت درخواست یا ثبت پزشک، خطا نیست.
        </p>
        <div className="flex flex-col gap-1.5">
          <p className="font-medium text-foreground">هر بخش چه زمانی پر می‌شود؟</p>
          <HelpList
            items={[
              "زمان‌بندی سوابق: درخواست رزرو، پذیرش یا رد آن، ثبت نسخه، تغییر وضعیت دارو، و یادآوری پیگیری — به‌ترتیب زمان.",
              "یادآوری‌های پیگیری: وقتی پزشک برای پیگیری بعدی (مثلاً مراجعه یا آزمایش) یادآوری بگذارد.",
              "داروها و نسخه‌ها: وقتی پزشک نسخه یا سابقهٔ دارو را ثبت کند. نسخه به‌معنای مصرف دارو توسط شما نیست.",
            ]}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="font-medium text-foreground">اعلان‌ها چگونه می‌رسند؟</p>
          <p>
            پیام‌های ماندگار در{" "}
            <Link href="/notifications" className="font-medium text-foreground underline-offset-4 hover:underline">
              صندوق اعلان‌ها
            </Link>{" "}
            ذخیره می‌شوند. برای دیدن آن‌ها کار جدا لازم نیست.
          </p>
          <HelpList
            items={[
              "پذیرش یا رد درخواست رزرو",
              "ثبت یادآوری پیگیری توسط پزشک و در روز موعد",
              "ثبت یا تغییر نسخه و دارو",
            ]}
          />
          <p>
            عدد روی زنگ یا روی «درخواست‌های من» و «پرونده» یعنی اعلان خوانده‌نشدهٔ
            همان موضوع. اعلان مرورگر اختیاری است، فقط وقتی این سایت باز باشد، و
            جزئیات پزشکی ندارد. وقتی سایت بسته است پیامک یا push ارسال نمی‌شود.
          </p>
        </div>
      </div>
    </details>
  );
}

export function TimelineSectionIntro() {
  return (
    <p className="max-w-[65ch] text-sm text-muted-foreground">
      رویدادها به‌ترتیب زمان. درخواست رزرو به‌معنای ویزیت انجام‌شده نیست.
    </p>
  );
}

export function TimelineEmptyHelp({
  showServicesLink = false,
}: {
  showServicesLink?: boolean;
}) {
  return (
    <div className="flex max-w-[65ch] flex-col gap-1.5">
      <p className="text-sm font-medium text-foreground">هنوز سابقه‌ای در پرونده ثبت نشده است.</p>
      <p className="text-sm text-muted-foreground">
        درخواست رزرو، نسخه و یادآوری پیگیری پزشک اینجا می‌آیند.
      </p>
      {showServicesLink ? (
        <Link
          href="/services"
          className="w-fit text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          مشاهدهٔ خدمات
        </Link>
      ) : null}
    </div>
  );
}

export function TimelinePhysicianEmpty() {
  return (
    <p className="text-sm text-muted-foreground">هنوز رویدادی در پرونده نیست.</p>
  );
}

export function RemindersSectionIntro() {
  return (
    <p className="max-w-[65ch] text-sm text-muted-foreground">
      یادآوری پیگیری را پزشک برای کار بعدی شما ثبت می‌کند.
    </p>
  );
}

export function RemindersEmptyHelp() {
  return (
    <div className="flex max-w-[65ch] flex-col gap-1.5">
      <p className="text-sm font-medium text-foreground">
        یادآوری پیگیری‌ای برای شما ثبت نشده است.
      </p>
      <p className="text-sm text-muted-foreground">
        وقتی پزشک یادآوری بگذارد، در این فهرست دیده می‌شود.
      </p>
    </div>
  );
}

export function MedicationsSectionIntro() {
  return (
    <p className="max-w-[65ch] text-sm text-muted-foreground">
      نسخه تجویز پزشک است، نه گزارش مصرف روزانه.
    </p>
  );
}

export function MedicationsEmptyHelp() {
  return (
    <div className="flex max-w-[65ch] flex-col gap-1.5">
      <p className="text-sm font-medium text-foreground">
        نسخه یا سابقه دارویی ثبت‌شده‌ای وجود ندارد.
      </p>
      <p className="text-sm text-muted-foreground">
        پس از ثبت توسط پزشک، نام دارو و وضعیت آن اینجا می‌آید.
      </p>
    </div>
  );
}

export function NotificationsGuide() {
  return (
    <Card className="bg-muted/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-foreground">
          اعلان‌ها چیست و چطور کار می‌کند؟
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
        <p>
          هر ردیف زیر یک پیام <strong className="font-medium text-foreground">ذخیره‌شده</strong>{" "}
          در حساب شماست. حذف خودبه‌خود نمی‌شود؛ می‌توانید «مشاهده» را بزنید تا
          به صفحهٔ مرتبط بروید و معمولاً همان‌جا خوانده‌شده علامت بخورد.
        </p>
        <div className="flex flex-col gap-1.5">
          <p className="font-medium text-foreground">چه زمانی اعلان می‌گیرید؟</p>
          <HelpList
            items={[
              "تغییر وضعیت درخواست رزرو (پذیرش یا رد)",
              "یادآوری پیگیری که پزشک برای شما گذاشته است",
              "ثبت نسخه، تمدید، پایان دوره یا قطع دارو در پرونده",
            ]}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="font-medium text-foreground">سه راه دیدن اعلان</p>
          <HelpList
            items={[
              "همین صفحه (صندوق اعلان‌ها) — همیشه با ورود به حساب در دسترس است",
              "عدد روی آیکن زنگ و روی تب‌های «درخواست‌های من» یا «پرونده» — فقط اعلان‌های همان موضوع",
              "اختیاری: اعلان کوتاه مرورگر — فقط وقتی این سایت در یکی از تب‌های مرورگر باز باشد و شما اجازه داده باشید",
            ]}
          />
        </div>
        <p>
          برای فعال کردن اعلان مرورگر، پایین همین صفحه «اجازهٔ اعلان مرورگر» را
          بزنید. رد کردن یا نداشتن پشتیبانی مانع استفاده از صندوق اعلان‌ها
          نمی‌شود. ارسال پیام وقتی سایت بسته است (push یا پیامک) در این نسخه
          وجود ندارد.
        </p>
      </CardContent>
    </Card>
  );
}

export function NotificationsEmptyInbox() {
  return (
    <p className="text-center text-sm text-muted-foreground">فعلاً اعلانی ندارید.</p>
  );
}
