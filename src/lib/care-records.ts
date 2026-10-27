import prisma from "@/lib/prisma";
import {
  sortTimeline,
  serviceRequestTimelineTitle,
  type TimelineEntry,
} from "@/lib/care-timeline";
import { latestStatus } from "@/lib/notifications";

export async function loadPatientCare(patientProfileId: string) {
  const [requests, prescriptions, reminders] = await Promise.all([
    prisma.serviceRequest.findMany({
      where: { patientProfileId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        service: { select: { id: true, title: true, published: true } },
      },
    }),
    prisma.prescription.findMany({
      where: { patientProfileId },
      orderBy: { prescribedAt: "desc" },
      include: {
        statusEvents: { orderBy: { occurredAt: "desc" } },
      },
    }),
    prisma.followUpReminder.findMany({
      where: { patientProfileId },
      orderBy: { dueAt: "desc" },
    }),
  ]);

  const timeline: TimelineEntry[] = [];

  for (const request of requests) {
    timeline.push({
      id: `request:${request.id}`,
      at: request.updatedAt,
      kind: "service_request",
      title: serviceRequestTimelineTitle(request.status),
      detail: request.service.title,
      href: request.service.published ? `/services/${request.service.id}` : null,
      status: request.status,
    });
  }

  for (const prescription of prescriptions) {
    timeline.push({
      id: `prescription:${prescription.id}`,
      at: prescription.prescribedAt,
      kind: "prescription",
      title: "نسخه",
      detail: `${prescription.medicationName} — ${prescription.dosage}`,
      href: `#prescription-${prescription.id}`,
    });
    for (const event of prescription.statusEvents) {
      if (event.status === "active") {
        continue;
      }
      timeline.push({
        id: `med-status:${event.id}`,
        at: event.occurredAt,
        kind: "medication_status",
        title: event.status === "completed" ? "پایان دورهٔ دارو" : "قطع دارو",
        detail: prescription.medicationName,
        href: `#prescription-${prescription.id}`,
      });
    }
  }

  for (const reminder of reminders) {
    timeline.push({
      id: `reminder:${reminder.id}`,
      at: reminder.dueAt,
      kind: "reminder",
      title: "یادآوری پیگیری",
      detail: reminder.title,
      href: `#reminder-${reminder.id}`,
    });
  }

  const medications = prescriptions.map((prescription) => {
    const current = latestStatus(prescription.statusEvents);
    return {
      ...prescription,
      currentStatus: current?.status ?? "active",
    };
  });

  return {
    requests,
    prescriptions: medications,
    reminders,
    timeline: sortTimeline(timeline),
  };
}
