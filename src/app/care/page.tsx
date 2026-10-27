import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { CountBadge } from "@/components/layout/count-badge";
import { SiteShell, siteProseClass } from "@/components/layout/site-shell";
import { CareTimeline } from "@/components/site/care-timeline";
import { MedicationList } from "@/components/site/medication-list";
import {
  CareFirstVisitWelcome,
  CareRecordGuide,
  MedicationsSectionIntro,
  RemindersSectionIntro,
  TimelineSectionIntro,
} from "@/components/site/patient-care-help";
import { ReminderList } from "@/components/site/reminder-list";
import { currentPatient, currentPhysician } from "@/lib/access";
import { loadPatientCare } from "@/lib/care-records";
import { loadNotificationSummary } from "@/lib/notification-summary";

async function MyCare() {
  await connection();
  const physician = await currentPhysician();
  if (physician) {
    redirect("/manage/patients");
  }
  const patient = await currentPatient();
  if (!patient) {
    redirect("/");
  }

  const [care, summary] = await Promise.all([
    loadPatientCare(patient.id),
    loadNotificationSummary(),
  ]);
  const isFirstVisit =
    care.timeline.length === 0 &&
    care.reminders.length === 0 &&
    care.prescriptions.length === 0;

  return (
    <SiteShell className="flex flex-col gap-8">
      <header className={`${siteProseClass} flex flex-col gap-1`}>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-foreground">پروندهٔ من</h1>
          {summary.unreadCare > 0 ? (
            <Link
              href="/notifications"
              className="inline-flex items-center rounded-lg border border-border bg-card px-2 py-1 text-xs font-medium text-foreground hover:bg-muted"
            >
              اعلان خوانده‌نشده
              <CountBadge count={summary.unreadCare} />
            </Link>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          فقط سوابق خودتان را می‌بینید. درخواست رزرو به‌معنای ویزیت انجام‌شده نیست.
        </p>
      </header>
      {isFirstVisit ? <CareFirstVisitWelcome /> : null}
      <CareRecordGuide />
      <section className="flex flex-col gap-2">
        <h2 className="text-base font-medium text-foreground">زمان‌بندی سوابق</h2>
        <TimelineSectionIntro />
        <CareTimeline
          entries={care.timeline}
          audience="patient"
          showServicesLink={!isFirstVisit && care.timeline.length === 0}
        />
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-base font-medium text-foreground">یادآوری‌های پیگیری</h2>
        <RemindersSectionIntro />
        <ReminderList reminders={care.reminders} canManage={false} asOf={new Date()} />
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-base font-medium text-foreground">داروها و نسخه‌ها</h2>
        <MedicationsSectionIntro />
        <MedicationList
          patientProfileId={patient.id}
          prescriptions={care.prescriptions}
          canManage={false}
        />
      </section>
    </SiteShell>
  );
}

export default function CarePage() {
  return (
    <Suspense
      fallback={
        <SiteShell>
          <p className="text-sm text-muted-foreground">در حال بارگذاری پرونده…</p>
        </SiteShell>
      }
    >
      <MyCare />
    </Suspense>
  );
}
