"use client";

import { useActionState } from "react";
import { useAuthOverlay } from "@/components/auth/auth-overlay";
import {
  cancelServiceRequest,
  createServiceRequest,
} from "@/lib/actions/requests";
import type { ActionState } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { fieldControlTextareaClass, surfaceCardClass } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

const statusLabel = {
  pending: "در انتظار",
  accepted: "پذیرفته‌شده",
  declined: "رد شده",
  cancelled: "لغو شده",
} as const;

export function RequestPanel({
  serviceId,
  signedIn,
  request,
}: {
  serviceId: string;
  signedIn: boolean;
  request: { id: string; status: keyof typeof statusLabel } | null;
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
      <form action={cancelAction} className="flex flex-col gap-2">
        <input type="hidden" name="id" value={request.id} />
        <p className="text-sm">{statusLabel.pending}</p>
        {cancelState?.ok === false ? (
          <p role="alert" className="text-sm text-destructive">
            {cancelState.error}
          </p>
        ) : null}
        <Button type="submit" variant="outline" disabled={cancelling}>
          لغو درخواست
        </Button>
      </form>
    );
  }

  if (request?.status === "accepted") {
    return <p className="text-sm">{statusLabel.accepted}</p>;
  }

  return (
    <form action={action} className={cn(surfaceCardClass, "flex flex-col gap-3 p-4")}>
      <input type="hidden" name="serviceId" value={serviceId} />
      {request ? <p className="text-sm text-muted-foreground">{statusLabel[request.status]}</p> : null}
      <label className="flex flex-col gap-1 text-sm" htmlFor="request-note">
        توضیح برای پزشک
        <textarea
          id="request-note"
          name="note"
          rows={4}
          maxLength={2000}
          className={fieldControlTextareaClass}
        />
      </label>
      {state?.ok === false ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p role="status" className="text-sm">
          درخواست ثبت شد.
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        درخواست رزرو
      </Button>
    </form>
  );
}
