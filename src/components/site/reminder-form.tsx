"use client";

import { useActionState, useEffect } from "react";
import { createFollowUpReminder } from "@/lib/actions/reminders";
import type { ActionState } from "@/lib/actions/state";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ReminderForm({ patientProfileId }: { patientProfileId: string }) {
  const { toast } = useToast();
  const [state, action, pending] = useActionState(
    createFollowUpReminder,
    null as ActionState,
  );

  useEffect(() => {
    if (state?.ok) {
      toast("یادآوری ثبت شد.");
    }
  }, [state, toast]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="patientProfileId" value={patientProfileId} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="reminder-title">عنوان یا هدف</FieldLabel>
          <Input id="reminder-title" name="title" required maxLength={120} />
        </Field>
        <Field>
          <FieldLabel htmlFor="reminder-message">پیام کوتاه</FieldLabel>
          <Textarea id="reminder-message" name="message" required rows={3} maxLength={2000} />
        </Field>
        <Field>
          <FieldLabel htmlFor="reminder-date">تاریخ موعد (تهران)</FieldLabel>
          <Input id="reminder-date" name="dueDate" type="date" required dir="ltr" lang="en" />
        </Field>
        <Field>
          <FieldLabel htmlFor="reminder-time">ساعت موعد (تهران)</FieldLabel>
          <Input id="reminder-time" name="dueTime" type="time" required dir="ltr" lang="en" />
        </Field>
        {state?.ok === false ? <FieldError>{state.error}</FieldError> : null}
        <Button type="submit" disabled={pending} aria-busy={pending} className="w-fit">
          {pending ? "در حال ثبت" : "ثبت یادآوری"}
        </Button>
      </FieldGroup>
    </form>
  );
}
