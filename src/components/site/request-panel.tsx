"use client";

import { useActionState } from "react";
import { useAuthOverlay } from "@/components/auth/auth-overlay";
import { createServiceRequest } from "@/lib/actions/requests";
import { CancelRequestForm } from "@/components/site/cancel-request-form";
import type { ActionState } from "@/lib/actions/state";
import { StatusBadge, type RequestStatus } from "@/components/site/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookingWindowPicker } from "@/components/site/booking-window-picker";
import type { PublicBookingDay } from "@/lib/booking-availability";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

export function RequestPanel({
  serviceId,
  signedIn,
  request,
  days,
}: {
  serviceId: string;
  signedIn: boolean;
  request: { id: string; status: RequestStatus } | null;
  days: PublicBookingDay[];
}) {
  const [state, action, pending] = useActionState(
    createServiceRequest,
    null as ActionState,
  );

  const { openAuth } = useAuthOverlay();

  if (!signedIn) {
    return (
      <Button type="button"  onClick={() => openAuth("login")}>
        برای درخواست رزرو وارد شوید
      </Button>
    );
  }

  if (request?.status === "pending") {
    return (
      <div className="flex w-full max-w-prose flex-col gap-2">
        <StatusBadge status="pending" />
        <CancelRequestForm id={request.id} />
      </div>
    );
  }

  if (request?.status === "accepted") {
    return <StatusBadge status="accepted" />;
  }

  return (
    <Card className="w-full max-w-prose">
      <CardContent>
        <form action={action}>
          <input type="hidden" name="serviceId" value={serviceId} />
          <FieldGroup>
            {request ? (
              <StatusBadge status={request.status} />
            ) : null}
            <BookingWindowPicker days={days} />
            <Field>
              <FieldLabel htmlFor="request-note">توضیح برای پزشک</FieldLabel>
              <Textarea id="request-note" name="note" rows={4} maxLength={2000} />
            </Field>
            {state?.ok === false ? <FieldError>{state.error}</FieldError> : null}
            {state?.ok ? (
              <p role="status" className="text-sm">
                درخواست ثبت شد.
              </p>
            ) : null}
            <Button type="submit" disabled={pending || days.length === 0} className="w-fit">
              درخواست رزرو
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
