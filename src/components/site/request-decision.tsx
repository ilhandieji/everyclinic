"use client";

import { useActionState } from "react";
import {
  acceptServiceRequest,
  declineServiceRequest,
} from "@/lib/actions/requests";
import type { ActionState } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";

export function RequestDecision({ id }: { id: string }) {
  const [acceptState, acceptAction, accepting] = useActionState(
    acceptServiceRequest,
    null as ActionState,
  );
  const [declineState, declineAction, declining] = useActionState(
    declineServiceRequest,
    null as ActionState,
  );
  const error = acceptState?.ok === false ? acceptState.error : declineState?.ok === false ? declineState.error : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={acceptAction}>
        <input type="hidden" name="id" value={id} />
        <Button type="submit" size="sm" disabled={accepting || declining}>
          پذیرفتن
        </Button>
      </form>
      <form action={declineAction}>
        <input type="hidden" name="id" value={id} />
        <Button type="submit" size="sm" variant="outline" disabled={accepting || declining}>
          رد کردن
        </Button>
      </form>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
