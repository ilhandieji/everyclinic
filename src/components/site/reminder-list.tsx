"use client";

import { useActionState, useEffect } from "react";
import { updateFollowUpReminderStatus } from "@/lib/actions/reminders";
import type { ActionState } from "@/lib/actions/state";
import { useToast } from "@/components/providers/toast-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RemindersEmptyHelp } from "@/components/site/patient-care-help";
import { cn } from "@/lib/utils";
import { formatFaDateTime } from "@/lib/tehran";

const statusLabel = {
  pending: "در انتظار",
  completed: "انجام‌شده",
  cancelled: "لغو شده",
} as const;

const statusClass = {
  pending: "border-transparent bg-amber-200 text-amber-950 dark:bg-amber-900 dark:text-amber-100",
  completed: "border-transparent bg-primary text-primary-foreground",
  cancelled: "border-transparent bg-muted text-muted-foreground",
} as const;

export function ReminderList({
  reminders,
  canManage,
  asOf,
}: {
  reminders: Array<{
    id: string;
    title: string;
    message: string;
    dueAt: Date;
    status: "pending" | "completed" | "cancelled";
  }>;
  canManage: boolean;
  asOf: Date | string;
}) {
  if (reminders.length === 0) {
    return canManage ? (
      <p className="text-sm text-muted-foreground">یادآوری پیگیری ثبت نشده است.</p>
    ) : (
      <Card size="sm">
        <CardContent>
          <RemindersEmptyHelp />
        </CardContent>
      </Card>
    );
  }

  const asOfMs = new Date(asOf).getTime();

  return (
    <ul className="flex w-full flex-col gap-2">
      {reminders.map((reminder) => {
        const duePast = reminder.dueAt.getTime() <= asOfMs;
        const dueHint =
          reminder.status === "pending" ? (duePast ? "گذشته" : "موعد") : null;
        return (
          <li key={reminder.id} id={`reminder-${reminder.id}`}>
            <Card size="sm">
              <CardContent className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className={cn("w-fit", statusClass[reminder.status])}>
                    {statusLabel[reminder.status]}
                  </Badge>
                  {dueHint ? (
                    <Badge variant="outline" className="w-fit">
                      {dueHint}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm font-medium text-foreground">{reminder.title}</p>
                <p className="whitespace-pre-wrap text-sm text-foreground">{reminder.message}</p>
                <time dateTime={reminder.dueAt.toISOString()} className="text-xs text-muted-foreground">
                  موعد: {formatFaDateTime(reminder.dueAt)}
                </time>
                {canManage && reminder.status === "pending" ? (
                  <ReminderStatusButtons id={reminder.id} />
                ) : null}
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

function ReminderStatusButtons({ id }: { id: string }) {
  const { toast } = useToast();
  const [state, action, pending] = useActionState(
    updateFollowUpReminderStatus,
    null as ActionState,
  );

  useEffect(() => {
    if (state?.ok) {
      toast("وضعیت یادآوری به‌روز شد.");
    }
  }, [state, toast]);

  return (
    <div className="flex flex-wrap gap-2">
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="completed" />
        <Button type="submit" size="sm" disabled={pending}>
          انجام شد
        </Button>
      </form>
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="cancelled" />
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          لغو
        </Button>
      </form>
      {state?.ok === false ? (
        <p role="alert" className="text-xs text-destructive">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
