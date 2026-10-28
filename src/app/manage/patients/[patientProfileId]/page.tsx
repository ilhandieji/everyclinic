import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { CareTimeline } from "@/components/site/care-timeline";
import { MedicationList } from "@/components/site/medication-list";
import { PrescriptionForm } from "@/components/site/prescription-form";
import { ReminderForm } from "@/components/site/reminder-form";
import { ReminderList } from "@/components/site/reminder-list";
import { currentPhysician, requirePhysicianPatientView } from "@/lib/access";
import { loadPatientCare } from "@/lib/care-records";
import { PageHeader } from "@/components/layout/page-header";
import { SiteLoading, SiteShell } from "@/components/layout/site-shell";
import { displayPatientName } from "@/lib/patient-name";

async function PatientCare({
  params,
}: {
  params: Promise<{ patientProfileId: string }>;
}) {
  await connection();
  const { patientProfileId } = await params;
  const scoped = await requirePhysicianPatientView(patientProfileId);
  if (!scoped) {
    const physician = await currentPhysician();
    if (!physician) {
      redirect("/");
    }
    notFound();
  }
  const fullName = displayPatientName(scoped.patient.user.name);
  const identity = (
    <div className="flex flex-col gap-1">
      <PageHeader title={fullName} />
      <p dir="ltr" lang="en" className="w-fit font-mono text-sm text-muted-foreground">
        {scoped.patient.user.email}
      </p>
    </div>
  );

  if (!scoped.hasCareRelationship) {
    return (
      <SiteShell className="flex flex-col gap-8">
        {identity}
        <p className="text-sm text-muted-foreground">
          برای ثبت یادآوری یا نسخه، ابتدا درخواست رزرو بیمار را بپذیرید.
        </p>
      </SiteShell>
    );
  }

  const care = await loadPatientCare(patientProfileId);

  return (
    <SiteShell className="flex flex-col gap-8">
      {identity}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">زمان‌بندی سوابق</h2>
        <CareTimeline entries={care.timeline} audience="physician" />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">یادآوری پیگیری</h2>
        <ReminderForm patientProfileId={patientProfileId} />
        <ReminderList reminders={care.reminders} canManage asOf={new Date()} />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">داروها و نسخه‌ها</h2>
        <p className="text-sm text-muted-foreground">
          ثبت نسخه به‌معنای مصرف دارو توسط بیمار نیست.
        </p>
        <PrescriptionForm patientProfileId={patientProfileId} />
        <MedicationList
          patientProfileId={patientProfileId}
          prescriptions={care.prescriptions}
          canManage
        />
      </section>
    </SiteShell>
  );
}

export default function ManagePatientPage({
  params,
}: {
  params: Promise<{ patientProfileId: string }>;
}) {
  return (
    <Suspense fallback={<SiteLoading label="در حال بارگذاری پرونده…" />}>
      <PatientCare params={params} />
    </Suspense>
  );
}
