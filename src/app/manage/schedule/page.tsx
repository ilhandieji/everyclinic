import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { SiteLoading, SiteShell } from "@/components/layout/site-shell";
import { ScheduleBoard } from "@/components/site/schedule-board";
import type { ScheduleDayView } from "@/components/site/schedule-day-card";
import { currentPhysician } from "@/lib/access";
import { loadAdminSchedule, type AdminBookingDay } from "@/lib/booking-availability";
import {
  addCivilDays,
  formatFaDate,
  formatFaDayNumber,
  formatFaMonthShort,
  formatFaWeekday,
  parseTehranDateTime,
  tehranCivilDate,
} from "@/lib/tehran";

function presentDay(day: AdminBookingDay): ScheduleDayView {
  const copyUntil = addCivilDays(day.date, 6) ?? day.date;
  const copyInstant = parseTehranDateTime(copyUntil, "12:00");
  return {
    ...day,
    dayNumber: formatFaDayNumber(day.date),
    monthShort: formatFaMonthShort(day.date),
    weekdayLong: formatFaWeekday(day.date, "long"),
    openWindowCountLabel: new Intl.NumberFormat("fa-IR").format(day.windows.length),
    copyUntil,
    copyPreview: copyInstant ? formatFaDate(copyInstant) : "",
  };
}

async function ScheduleEditor() {
  await connection();
  const physician = await currentPhysician();
  if (!physician) {
    redirect("/");
  }

  const days = (await loadAdminSchedule(physician.id)).map(presentDay);
  const today = tehranCivilDate();

  return (
    <SiteShell className="flex flex-col gap-6">
      <PageHeader
        title="زمان‌بندی مطب"
        lede="ساعت پذیرش هر روز را برای چهار هفتهٔ پیش رو مشخص کنید."
      />
      {days.length === 0 ? (
        <EmptyState>زمان‌بندی در دسترس نیست.</EmptyState>
      ) : (
        <ScheduleBoard days={days} today={today} />
      )}
    </SiteShell>
  );
}

export default function ManageSchedulePage() {
  return (
    <Suspense fallback={<SiteLoading label="در حال بارگذاری زمان‌بندی…" />}>
      <ScheduleEditor />
    </Suspense>
  );
}
