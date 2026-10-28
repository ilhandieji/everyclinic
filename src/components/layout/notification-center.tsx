"use client";

import { useCallback, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, Popover } from "radix-ui";
import { Bell, X } from "lucide-react";
import { CountBadge } from "@/components/layout/count-badge";
import { NotificationInboxList } from "@/components/layout/notification-inbox-list";
import { clearAllNotifications } from "@/lib/actions/notifications";
import {
  emptyNotificationSummary,
  NOTIFICATIONS_CLEARED_EVENT,
  NOTIFICATION_UNREAD_TOTAL_STORAGE_KEY,
  type NotificationInboxItem,
  type NotificationSummary,
} from "@/lib/notification-types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const MOBILE_MEDIA = "(max-width: 767px)";

function subscribeMobileLayout(onStoreChange: () => void) {
  const media = window.matchMedia(MOBILE_MEDIA);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_MEDIA).matches;
}

function getMobileServerSnapshot() {
  return false;
}

function useMobileLayout() {
  return useSyncExternalStore(subscribeMobileLayout, getMobileSnapshot, getMobileServerSnapshot);
}

function BellTrigger({
  label,
  count,
  expanded,
  className,
  ...props
}: React.ComponentProps<typeof Button> & {
  label: string;
  count: number;
  expanded?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "relative text-muted-foreground hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground",
        className,
      )}
      aria-label={label}
      aria-expanded={expanded}
      {...props}
    >
      <Bell aria-hidden className="size-4" />
      <CountBadge count={count} />
    </Button>
  );
}

function InboxPanel({
  items,
  loading,
  clearing,
  onRefresh,
  onClearAll,
  onNavigate,
  className,
}: {
  items: NotificationInboxItem[];
  loading: boolean;
  clearing?: boolean;
  onRefresh: () => void;
  onClearAll?: () => void;
  onNavigate?: () => void;
  className?: string;
}) {
  const showClear = items.length > 0 && onClearAll;

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/70 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">اعلان‌ها</h2>
        <div className="flex items-center gap-2">
          {loading ? (
            <span className="text-xs text-muted-foreground">در حال بارگذاری…</span>
          ) : null}
          {showClear ? (
            <Button
              type="button"
              size="xs"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              disabled={clearing}
              onClick={onClearAll}
           >
              {clearing ? "در حال پاک‌سازی…" : "پاک کردن همه"}
            </Button>
          ) : null}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <NotificationInboxList
          items={items}
          onChange={onRefresh}
          onNavigate={onNavigate}
          compact
        />
      </div>
    </div>
  );
}

export function NotificationCenter({
  summary,
  onSummary,
}: {
  summary: NotificationSummary;
  onSummary: (summary: NotificationSummary) => void;
}) {
  const router = useRouter();
  const isMobile = useMobileLayout();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationInboxItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [clearing, startClearTransition] = useTransition();

  const loadInbox = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/notifications/inbox");
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as { items: NotificationInboxItem[] };
      setItems(data.items);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSummary = useCallback(() => {
    void fetch("/api/notifications/summary")
      .then((response) => (response.ok ? response.json() : null))
      .then((next) => {
        if (next) {
          onSummary(next as NotificationSummary);
        }
      });
  }, [onSummary]);

  const refresh = useCallback(() => {
    void loadInbox();
    refreshSummary();
    router.refresh();
  }, [loadInbox, refreshSummary, router]);

  const clearAll = useCallback(() => {
    startClearTransition(async () => {
      const ok = await clearAllNotifications();
      if (!ok) {
        return;
      }
      setItems([]);
      onSummary(emptyNotificationSummary);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(NOTIFICATION_UNREAD_TOTAL_STORAGE_KEY, "0");
        window.dispatchEvent(new Event(NOTIFICATIONS_CLEARED_EVENT));
      }
      router.refresh();
    });
  }, [onSummary, router]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (next) {
        void loadInbox();
      }
    },
    [loadInbox],
  );

  const bellLabel =
    summary.unreadTotal > 0
      ? `اعلان‌ها، ${summary.unreadTotal} خوانده‌نشده`
      : "اعلان‌ها";

  if (isMobile) {
    return (
      <>
        <BellTrigger
          label={bellLabel}
          count={summary.unreadTotal}
          expanded={open}
          onClick={() => handleOpenChange(true)}
        />
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[60] bg-background" />
            <Dialog.Content className="fixed inset-0 z-[70] flex flex-col bg-background outline-none">
              <Dialog.Title className="sr-only">اعلان‌ها</Dialog.Title>
              <header className="flex shrink-0 items-center justify-between border-b border-border/80 px-3 py-2.5">
                <span className="text-sm font-semibold text-foreground">اعلان‌ها</span>
                <Dialog.Close asChild>
                  <Button type="button" variant="ghost" size="icon" aria-label="بستن اعلان‌ها">
                    <X aria-hidden className="size-5" />
                  </Button>
                </Dialog.Close>
              </header>
              <InboxPanel
                items={items}
                loading={loading}
                clearing={clearing}
                onRefresh={refresh}
                onClearAll={clearAll}
                onNavigate={() => setOpen(false)}
                className="flex-1"
              />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </>
    );
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <BellTrigger label={bellLabel} count={summary.unreadTotal} expanded={open} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="z-[60] w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          onOpenAutoFocus={(event) => event.preventDefault()}
       >
          <InboxPanel
            items={items}
            loading={loading}
            clearing={clearing}
            onRefresh={refresh}
            onClearAll={clearAll}
            onNavigate={() => setOpen(false)}
            className="max-h-[min(32rem,70vh)]"
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function NotificationCenterPage({
  initialItems,
  closeHref = "/",
}: {
  initialItems: NotificationInboxItem[];
  closeHref?: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [clearing, startClearTransition] = useTransition();

  const clearAll = useCallback(() => {
    startClearTransition(async () => {
      const ok = await clearAllNotifications();
      if (!ok) {
        return;
      }
      setItems([]);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(NOTIFICATION_UNREAD_TOTAL_STORAGE_KEY, "0");
        window.dispatchEvent(new Event(NOTIFICATIONS_CLEARED_EVENT));
      }
      router.refresh();
    });
  }, [router]);

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border/80 px-3 py-2.5">
        <h1 className="text-xl font-semibold text-foreground">اعلان‌ها</h1>
        <div className="flex items-center gap-1">
          {items.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={clearing}
              onClick={clearAll}
            >
              {clearing ? "در حال پاک‌سازی…" : "پاک کردن همه"}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="بستن"
            onClick={() => router.push(closeHref)}
          >
            <X aria-hidden className="size-5" />
          </Button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <NotificationInboxList items={items} onChange={() => router.refresh()} />
      </div>
    </div>
  );
}
