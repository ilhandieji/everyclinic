import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { ScheduleDayCard } from "@/components/site/schedule-day-card";
import { currentPhysician } from "@/lib/access";
import { loadAdminSchedule } from "@/lib/booking-availability";
import { SiteShell, siteProseClass } from "@/components/layout/site-shell";

async function ScheduleEditor() {
  await connection();
  const physician = await currentPhysician();
  if (!physician) {
    redirect("/");
  }

  const days = await loadAdminSchedule(physician.id);

  return (
    <SiteShell className="flex flex-col gap-6">
      <header className={`${siteProseClass} flex flex-col gap-1`}>
        <h1 className="text-lg font-semibold text-foreground">زمان‌بندی مطب</h1>
        <p className="text-sm text-muted-foreground">
          برای هر روز ساعت پذیرش را بنویسید. اگر چند روز پشت‌سرهم یکسان است، همان ساعت‌ها را از روی
          همان روز تا تاریخ دلخواه تکرار کنید.
        </p>
      </header>

      <ul className="flex flex-col gap-4">
        {days.map((day) => (
          <li key={day.date}>
            <ScheduleDayCard day={day} />
          </li>
        ))}
      </ul>
    </SiteShell>
  );
}

export default function ManageSchedulePage() {
  return (
    <Suspense
      fallback={
        <SiteShell>
          <p className="text-sm text-muted-foreground">در حال بارگذاری زمان‌بندی…</p>
        </SiteShell>
      }
    >
      <ScheduleEditor />
    </Suspense>
  );
}
