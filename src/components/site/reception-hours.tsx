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
    <section
      id="reception-hours"
      aria-labelledby="reception-hours-heading"
      className="scroll-mt-24"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-16">
        <div className="flex min-w-0 flex-col items-start gap-4 lg:w-72 lg:shrink-0">
          <div className="flex max-w-[65ch] flex-col gap-1">
            <h2 id="reception-hours-heading" className="text-2xl font-semibold">
              ساعات پذیرش
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              ساعت‌های هفت روز آینده. روزی که ساعت ندارد هنوز از طرف پزشک اعلام نشده است.
            </p>
          </div>
          <p className="flex items-center gap-2 text-sm">
            <Phone className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">تلفن مطب</span>
            <a
              href="tel:09110000000"
              dir="ltr"
              lang="en"
              className="focus-ring rounded-sm font-medium text-foreground"
            >
              0911 000 000
            </a>
          </p>
          <Button asChild>
            <Link href="/services">رزرو آنلاین نوبت</Link>
          </Button>
        </div>
        {days.length > 0 ? (
          <div className="min-w-0 w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm lg:w-[min(100%,36rem)]">
            <ul>
              {days.map((day) => (
                <li
                  key={day.date}
                  className="flex items-start justify-between gap-4 border-t border-border px-4 py-3 first:border-t-0"
                >
                  <div className="flex shrink-0 flex-col gap-0.5">
                    <span className="flex items-center gap-3 text-sm font-medium text-foreground">
                      <span className="whitespace-nowrap">{day.weekday}</span>
                      {day.today ? (
                        <span className="shrink-0 whitespace-nowrap text-xs font-medium text-primary">
                          امروز
                        </span>
                      ) : null}
                    </span>
                    <span className="text-xs text-muted-foreground">{day.dateLabel}</span>
                  </div>
                  <p
                    className={
                      day.status === "closed"
                        ? "min-w-0 text-end text-sm leading-relaxed text-muted-foreground"
                        : "min-w-0 text-end text-sm leading-relaxed text-foreground"
                    }
                  >
                    {day.status === "open" ? day.hoursLabel : receptionStatusLabel[day.status]}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
