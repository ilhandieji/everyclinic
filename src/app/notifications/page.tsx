import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { NotificationCenterPage } from "@/components/layout/notification-center";
import { currentUser } from "@/lib/access";
import { loadNotificationInbox } from "@/lib/notification-inbox";

async function InboxPage() {
  await connection();
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }

  const items = await loadNotificationInbox(100);

  return <NotificationCenterPage initialItems={items} />;
}

export default function NotificationsPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">در حال بارگذاری اعلان‌ها…</p>
        </div>
      }
    >
      <InboxPage />
    </Suspense>
  );
}
