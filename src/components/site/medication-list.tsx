"use client";

import { useActionState, useEffect, useState } from "react";
import { appendMedicationStatus } from "@/lib/actions/prescriptions";
import type { ActionState } from "@/lib/actions/state";
import { PrescriptionForm } from "@/components/site/prescription-form";
import { useToast } from "@/components/providers/toast-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MedicationsEmptyHelp } from "@/components/site/patient-care-help";
import { cn } from "@/lib/utils";
import { formatFaDate, formatFaDateTime } from "@/lib/tehran";

const statusLabel = {
  active: "فعال",
  completed: "پایان‌یافته",
  discontinued: "قطع‌شده",
} as const;

const statusClass = {
  active: "border-transparent",
  completed: "border-transparent bg-muted text-muted-foreground",
  discontinued: "border-transparent bg-destructive/10 text-destructive",
} as const;

const activeTone = {
  backgroundColor: "var(--status-accepted)",
  color: "var(--status-accepted-foreground)",
} as const;

type PrescriptionRow = {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  notes: string | null;
  prescribedAt: Date;
  startDate: Date;
  currentStatus: "active" | "completed" | "discontinued";
  statusEvents: Array<{
    id: string;
    status: "active" | "completed" | "discontinued";
    occurredAt: Date;
    endDate: Date | null;
    note: string | null;
  }>;
};

export function MedicationList({
  patientProfileId,
  prescriptions,
  canManage,
}: {
  patientProfileId: string;
  prescriptions: PrescriptionRow[];
  canManage: boolean;
}) {
  if (prescriptions.length === 0) {
    return canManage ? (
      <p className="text-sm text-muted-foreground">
        دارویی در پرونده ثبت نشده است. نسخه فقط تجویز است و به‌معنای مصرف نیست.
      </p>
    ) : (
      <Card size="sm">
        <CardContent>
          <MedicationsEmptyHelp />
        </CardContent>
      </Card>
    );
  }

  return (
    <ul className="flex w-full flex-col gap-2">
      {prescriptions.map((prescription) => (
        <li key={prescription.id} id={`prescription-${prescription.id}`}>
          <Card size="sm">
            <CardContent className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="outline"
                  className={cn("w-fit", statusClass[prescription.currentStatus])}
                  style={prescription.currentStatus === "active" ? activeTone : undefined}
                >
                  {statusLabel[prescription.currentStatus]}
                </Badge>
              </div>
              <p dir="auto" className="text-sm font-medium text-foreground">
                {prescription.medicationName}
              </p>
              <p dir="auto" className="text-sm text-foreground">
                {prescription.dosage} — {prescription.frequency}
              </p>
              <p className="text-xs text-muted-foreground">
                تجویز: {formatFaDateTime(prescription.prescribedAt)} — شروع:{" "}
                {formatFaDate(prescription.startDate)}
              </p>
              {prescription.notes ? (
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {prescription.notes}
                </p>
              ) : null}
              <ol className="flex flex-col gap-1 text-xs text-muted-foreground">
                {prescription.statusEvents.map((event) => (
                  <li key={event.id}>
                    {statusLabel[event.status]} — {formatFaDateTime(event.occurredAt)}
                    {event.note ? ` — ${event.note}` : ""}
                  </li>
                ))}
              </ol>
              {canManage && prescription.currentStatus === "active" ? (
                <MedicationActions
                  patientProfileId={patientProfileId}
                  prescriptionId={prescription.id}
                />
              ) : null}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function MedicationActions({
  patientProfileId,
  prescriptionId,
}: {
  patientProfileId: string;
  prescriptionId: string;
}) {
  const { toast } = useToast();
  const [renew, setRenew] = useState(false);
  const [state, action, pending] = useActionState(
    appendMedicationStatus,
    null as ActionState,
  );

  useEffect(() => {
    if (state?.ok) {
      toast("وضعیت دارو ثبت شد.");
    }
  }, [state, toast]);

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-3">
      <div className="flex flex-col gap-2">
        <form action={action} className="flex flex-col gap-2">
          <input type="hidden" name="prescriptionId" value={prescriptionId} />
          <input type="hidden" name="status" value="completed" />
          <Field>
            <FieldLabel htmlFor={`end-${prescriptionId}`}>تاریخ پایان (اختیاری)</FieldLabel>
            <Input id={`end-${prescriptionId}`} name="endDate" type="date" dir="ltr" lang="en" />
          </Field>
          <Field>
            <FieldLabel htmlFor={`note-${prescriptionId}`}>یادداشت وضعیت</FieldLabel>
            <Textarea id={`note-${prescriptionId}`} name="note" rows={2} maxLength={2000} />
          </Field>
          {state?.ok === false ? (
            <p role="alert" className="text-xs text-destructive">
              {state.error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              پایان دوره
            </Button>
          </div>
        </form>
        <form action={action}>
          <input type="hidden" name="prescriptionId" value={prescriptionId} />
          <input type="hidden" name="status" value="discontinued" />
          <input type="hidden" name="endDate" value="" />
          <input type="hidden" name="note" value="" />
          <Button type="submit" size="sm" variant="outline" disabled={pending}>
            قطع دارو
          </Button>
        </form>
      </div>
      <div>
        <Button type="button" size="sm" variant="ghost" onClick={() => setRenew((open) => !open)}>
          {renew ? "بستن تمدید" : "تمدید با نسخهٔ جدید"}
        </Button>
        {renew ? (
          <PrescriptionForm patientProfileId={patientProfileId} renewsId={prescriptionId} />
        ) : null}
      </div>
    </div>
  );
}
