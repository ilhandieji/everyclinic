import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { SiteLoading } from "@/components/layout/site-shell";
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
      fallback={<SiteLoading label="در حال بارگذاری اعلان‌ها…" />}
    >
      <InboxPage />
    </Suspense>
  );
}
