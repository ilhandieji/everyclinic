"use client";

import { useActionState } from "react";
import { cancelServiceRequest } from "@/lib/actions/requests";
import type { ActionState } from "@/lib/actions/state";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";

export function CancelRequestForm({ id }: { id: string }) {
  const [cancelState, cancelAction, cancelling] = useActionState(
    cancelServiceRequest,
    null as ActionState,
  );

  return (
    <form action={cancelAction} className="flex max-w-md flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      {cancelState?.ok === false ? <FieldError>{cancelState.error}</FieldError> : null}
      <Button type="submit" variant="outline" disabled={cancelling} className="w-fit">
        لغو درخواست
      </Button>
    </form>
  );
}
