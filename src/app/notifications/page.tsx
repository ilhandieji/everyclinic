import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { markNotificationRead, openNotification } from "@/lib/actions/notifications";
import { currentUser } from "@/lib/access";
import { BrowserNotificationSettings } from "@/components/site/browser-notification-settings";
import {
  NotificationsEmptyInbox,
  NotificationsGuide,
} from "@/components/site/patient-care-help";
import { SiteShell, sitePanelClass, siteProseClass } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { formatFaDateTime } from "@/lib/tehran";

const categoryLabel = {
  service_request: "درخواست رزرو",
  reminder: "یادآوری",
  medication: "دارو",
} as const;

async function Inbox() {
  await connection();
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }

  const notifications = await prisma.notification.findMany({
    where: { recipientUserId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <SiteShell className="flex flex-col gap-6">
      <header className={`${siteProseClass} flex flex-col gap-1`}>
        <h1 className="text-lg font-semibold text-foreground">اعلان‌ها</h1>
        <p className="text-sm text-muted-foreground">
          پیام‌های ماندگار مربوط به درخواست، یادآوری و دارو — جدا از اعلان کوتاه
          مرورگر.
        </p>
      </header>
      <NotificationsGuide />
      <div className={sitePanelClass}>
        <BrowserNotificationSettings />
      </div>
      {notifications.length === 0 ? (
        <Card className={sitePanelClass}>
          <CardContent>
            <NotificationsEmptyInbox />
          </CardContent>
        </Card>
      ) : (
        <ul className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          {notifications.map((item) => (
            <li key={item.id}>
              <Card className={cn(item.readAt && "opacity-80")}>
                <CardContent className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-foreground">{item.body}</p>
                  <p className="text-xs text-muted-foreground">
                    {categoryLabel[item.category]}
                    {item.readAt ? " — خوانده‌شده" : " — خوانده‌نشده"}
                  </p>
                  <time
                    dateTime={item.createdAt.toISOString()}
                    className="text-xs text-muted-foreground"
                  >
                    {formatFaDateTime(item.createdAt)}
                  </time>
                  <div className="flex flex-wrap gap-2">
                    <form action={openNotification}>
                      <input type="hidden" name="id" value={item.id} />
                      <Button type="submit" size="sm">
                        مشاهده
                      </Button>
                    </form>
                    {!item.readAt ? (
                      <form action={markNotificationRead}>
                        <input type="hidden" name="id" value={item.id} />
                        <Button type="submit" size="sm" variant="outline">
                          خوانده شد
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </SiteShell>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense
      fallback={
        <SiteShell>
          <p className="text-sm text-muted-foreground">در حال بارگذاری اعلان‌ها…</p>
        </SiteShell>
      }
    >
      <Inbox />
    </Suspense>
  );
}
