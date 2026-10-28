"use client";

import { useActionState, useEffect } from "react";
import { createPrescription } from "@/lib/actions/prescriptions";
import type { ActionState } from "@/lib/actions/state";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function PrescriptionForm({
  patientProfileId,
  renewsId,
}: {
  patientProfileId: string;
  renewsId?: string;
}) {
  const { toast } = useToast();
  const [state, action, pending] = useActionState(
    createPrescription,
    null as ActionState,
  );

  useEffect(() => {
    if (state?.ok) {
      toast(renewsId ? "تمدید دارو ثبت شد." : "نسخه ثبت شد.");
    }
  }, [renewsId, state, toast]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="patientProfileId" value={patientProfileId} />
      {renewsId ? <input type="hidden" name="renewsId" value={renewsId} /> : null}
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`med-name-${renewsId ?? "new"}`}>نام دارو</FieldLabel>
          <Input
            id={`med-name-${renewsId ?? "new"}`}
            name="medicationName"
            required
            dir="auto"
            maxLength={120}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`med-dose-${renewsId ?? "new"}`}>دوز</FieldLabel>
          <Input id={`med-dose-${renewsId ?? "new"}`} name="dosage" required maxLength={120} />
        </Field>
        <Field>
          <FieldLabel htmlFor={`med-freq-${renewsId ?? "new"}`}>نحوهٔ مصرف</FieldLabel>
          <Input
            id={`med-freq-${renewsId ?? "new"}`}
            name="frequency"
            required
            maxLength={240}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`med-start-${renewsId ?? "new"}`}>تاریخ شروع</FieldLabel>
          <Input
            id={`med-start-${renewsId ?? "new"}`}
            name="startDate"
            type="date"
            required
            dir="ltr"
            lang="en"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`med-notes-${renewsId ?? "new"}`}>یادداشت</FieldLabel>
          <Textarea id={`med-notes-${renewsId ?? "new"}`} name="notes" rows={3} maxLength={2000} />
        </Field>
        {state?.ok === false ? <FieldError>{state.error}</FieldError> : null}
        <Button type="submit" disabled={pending} aria-busy={pending} className="h-11 w-fit">
          {pending ? "در حال ثبت" : renewsId ? "ثبت تمدید" : "ثبت نسخه"}
        </Button>
      </FieldGroup>
    </form>
  );
}
