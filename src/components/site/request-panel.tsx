"use client";

import { useActionState } from "react";
import { useAuthOverlay } from "@/components/auth/auth-overlay";
import {
  cancelServiceRequest,
  createServiceRequest,
} from "@/lib/actions/requests";
import type { ActionState } from "@/lib/actions/profile";
import { StatusBadge, type RequestStatus } from "@/components/site/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

export function RequestPanel({
  serviceId,
  signedIn,
  request,
}: {
  serviceId: string;
  signedIn: boolean;
  request: { id: string; status: RequestStatus } | null;
}) {
  const [state, action, pending] = useActionState(
    createServiceRequest,
    null as ActionState,
  );
  const [cancelState, cancelAction, cancelling] = useActionState(
    cancelServiceRequest,
    null as ActionState,
  );

  const { openAuth } = useAuthOverlay();

  if (!signedIn) {
    return (
      <Button type="button" onClick={() => openAuth("login")}>
        برای درخواست رزرو وارد شوید
      </Button>
    );
  }

  if (request?.status === "pending") {
    return (
      <form action={cancelAction} className="flex max-w-md flex-col gap-2">
        <input type="hidden" name="id" value={request.id} />
        <StatusBadge status="pending" />
        {cancelState?.ok === false ? <FieldError>{cancelState.error}</FieldError> : null}
        <Button type="submit" variant="outline" disabled={cancelling} className="w-fit">
          لغو درخواست
        </Button>
      </form>
    );
  }

  if (request?.status === "accepted") {
    return <StatusBadge status="accepted" />;
  }

  return (
    <Card className="max-w-xl">
      <CardContent>
        <form action={action}>
          <input type="hidden" name="serviceId" value={serviceId} />
          <FieldGroup>
            {request ? (
              <StatusBadge status={request.status} />
            ) : null}
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
            <Button type="submit" disabled={pending} className="w-fit">
              درخواست رزرو
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
