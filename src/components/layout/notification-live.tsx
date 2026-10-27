"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/providers/toast-provider";
import {
  BROWSER_NOTIFICATION_BODY,
  BROWSER_NOTIFICATION_TITLE,
  emptyNotificationSummary,
  INBOX_TOAST_MESSAGE,
  NOTIFICATIONS_CLEARED_EVENT,
  NOTIFICATION_UNREAD_TOTAL_STORAGE_KEY,
  type NotificationSummary,
} from "@/lib/notification-types";

const STORAGE_PERMISSION = "clinic-browser-notifications";

export function NotificationLive({
  onSummary,
}: {
  onSummary: (summary: NotificationSummary) => void;
}) {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const signedIn = Boolean(session?.user?.email) && !session?.error;
  const previousTotal = useRef<number | null>(null);

  useEffect(() => {
    const onCleared = () => {
      previousTotal.current = 0;
      onSummary(emptyNotificationSummary);
      window.sessionStorage.setItem(NOTIFICATION_UNREAD_TOTAL_STORAGE_KEY, "0");
    };
    window.addEventListener(NOTIFICATIONS_CLEARED_EVENT, onCleared);
    return () => window.removeEventListener(NOTIFICATIONS_CLEARED_EVENT, onCleared);
  }, [onSummary]);

  useEffect(() => {
    if (status === "loading" || !signedIn) {
      onSummary(emptyNotificationSummary);
      return;
    }

    let cancelled = false;

    async function load(announce: boolean) {
      if (document.visibilityState === "hidden") {
        return;
      }
      try {
        const response = await fetch("/api/notifications/summary");
        if (!response.ok) {
          return;
        }
        const summary = (await response.json()) as NotificationSummary;
        if (cancelled) {
          return;
        }
        onSummary(summary);
        const lastStored = Number(
          window.sessionStorage.getItem(NOTIFICATION_UNREAD_TOTAL_STORAGE_KEY) ?? "0",
        );
        const previous = previousTotal.current ?? lastStored;
        if (announce && summary.unreadTotal > previous) {
          toast(INBOX_TOAST_MESSAGE);
          if (
            window.localStorage.getItem(STORAGE_PERMISSION) === "granted" &&
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification(BROWSER_NOTIFICATION_TITLE, {
              body: BROWSER_NOTIFICATION_BODY,
            });
          }
        }
        previousTotal.current = summary.unreadTotal;
        window.sessionStorage.setItem(
          NOTIFICATION_UNREAD_TOTAL_STORAGE_KEY,
          String(summary.unreadTotal),
        );
      } catch {
        // Polling is best-effort; the inbox page remains the source of truth.
      }
    }

    void load(false);
    const interval = window.setInterval(() => {
      void load(true);
    }, 60_000);
    const onVisible = () => {
      void load(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [onSummary, signedIn, status, toast]);

  return null;
}
