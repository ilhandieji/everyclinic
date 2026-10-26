"use client";

import { useActionState } from "react";
import { deleteService } from "@/lib/actions/services";
import type { ActionState } from "@/lib/actions/state";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";

export function DeleteServiceButton({ id }: { id: string }) {
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteService,
    null as ActionState,
  );

  return (
    <form
      action={deleteAction}
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        if (!window.confirm("این خدمت حذف شود؟")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      {deleteState?.ok === false ? <FieldError>{deleteState.error}</FieldError> : null}
      <Button type="submit" variant="destructive" disabled={deleting} className="w-fit">
        حذف خدمت
      </Button>
    </form>
  );
}
