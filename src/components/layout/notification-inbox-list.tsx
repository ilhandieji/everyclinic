"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  markNotificationReadById,
  openNotificationById,
} from "@/lib/actions/notifications";
import {
  notificationCategoryLabel,
  type NotificationInboxItem,
} from "@/lib/notification-types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function formatFaDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fa-IR", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationInboxList({
  items,
  onChange,
  onNavigate,
  compact = false,
}: {
  items: NotificationInboxItem[];
  onChange?: () => void;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (items.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        فعلاً اعلانی ندارید.
      </p>
    );
  }

  function refresh() {
    onChange?.();
    router.refresh();
  }

  function openItem(id: string) {
    startTransition(async () => {
      const href = await openNotificationById(id);
      if (href) {
        refresh();
        onNavigate?.();
        router.push(href);
      }
    });
  }

  function markRead(id: string) {
    startTransition(async () => {
      await markNotificationReadById(id);
      refresh();
    });
  }

  return (
    <ul className={cn("flex flex-col", compact ? "gap-0" : "gap-2")} aria-busy={pending}>
      {items.map((item) => {
        const unread = item.readAt === null;
        return (
          <li
            key={item.id}
            className={cn(
              "border-b border-border/70 last:border-b-0",
              unread && "bg-muted/35",
            )}
          >
            <div className="flex gap-3 px-4 py-3">
              <span
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  unread ? "bg-primary" : "bg-transparent",
                )}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  className="flex w-full flex-col gap-1 text-start outline-none focus-visible:ring-1 focus-visible:ring-ring/50"
                  onClick={() => openItem(item.id)}
                >
                  <span className="text-sm font-medium text-foreground">{item.title}</span>
                  <span className="line-clamp-2 text-sm text-muted-foreground">{item.body}</span>
                  <span className="text-xs text-muted-foreground">
                    {notificationCategoryLabel[item.category]}
                    {" · "}
                    <time dateTime={item.createdAt}>{formatFaDateTime(item.createdAt)}</time>
                  </span>
                </button>
                {unread ? (
                  <div className="mt-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => markRead(item.id)}
                    >
                      خوانده شد
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
