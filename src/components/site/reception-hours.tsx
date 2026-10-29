import Link from "next/link";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicReceptionDay } from "@/lib/booking-availability";

const receptionStatusLabel = {
  closed: "تعطیل",
  undeclared: "این روز اعلام نشده",
} as const;

export function ReceptionHours({ days }: { days: PublicReceptionDay[] }) {
  return (
    <section id="reception-hours" aria-labelledby="reception-hours-heading">
      <div
        className={
          days.length > 0
            ? "overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]"
            : "overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        }
      >
        <div className="flex min-w-0 flex-col items-start gap-5 border-b border-border p-6 md:p-8 lg:border-b-0 lg:border-e">
          <div className="flex max-w-[36rem] flex-col gap-2">
            <h2 id="reception-hours-heading" className="text-3xl font-semibold">
              ساعات پذیرش
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              ساعت‌های هفت روز آینده. روزی که ساعت ندارد هنوز از طرف پزشک اعلام نشده است.
            </p>
          </div>
          <p className="inline-flex min-h-11 items-center gap-2 text-base font-medium text-foreground">
            <Phone className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="sr-only">تلفن مطب</span>
            <a
              href="tel:09110000000"
              dir="ltr"
              lang="en"
              className="focus-ring rounded-sm"
            >
              0911 000 000
            </a>
          </p>
          <Button asChild className="h-11 px-5">
            <Link href="/#services">رزرو آنلاین نوبت</Link>
          </Button>
        </div>
        {days.length > 0 ? (
          <ul className="min-w-0">
            {days.map((day) => (
              <li
                key={day.date}
                className="flex items-start justify-between gap-4 border-t border-border px-6 py-3.5 first:border-t-0 md:px-8"
              >
                <div className="flex shrink-0 flex-col gap-0.5">
                  <span className="flex items-center gap-2 text-base font-medium text-foreground">
                    <span className="whitespace-nowrap">{day.weekday}</span>
                    {day.today ? (
                      <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-primary">
                        امروز
                      </span>
                    ) : null}
                  </span>
                  <span className="text-sm text-muted-foreground">{day.dateLabel}</span>
                </div>
                <p
                  className={
                    day.status === "closed"
                      ? "min-w-0 pt-0.5 text-end text-base leading-relaxed text-muted-foreground"
                      : "min-w-0 pt-0.5 text-end text-base leading-relaxed text-foreground"
                  }
                >
                  {day.status === "open" ? day.hoursLabel : receptionStatusLabel[day.status]}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
