"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_PERMISSION = "clinic-browser-notifications";

export function BrowserNotificationSettings() {
  const [result, setResult] = useState<string | null>(null);

  async function requestPermission() {
    if (typeof Notification === "undefined") {
      setResult("unsupported");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      window.localStorage.setItem(STORAGE_PERMISSION, "granted");
    } else {
      window.localStorage.removeItem(STORAGE_PERMISSION);
    }
    setResult(permission);
  }

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-sm text-muted-foreground">
        اگر می‌خواهید هنگام باز بودن سایت اعلان عمومی مرورگر ببینید، اجازه را از اینجا بدهید.
        نام دارو یا تشخیص در اعلان مرورگر نمی‌آید. ارسال پس از بستن سایت پیاده‌سازی نشده است.
      </p>
      {result === "unsupported" ? (
        <p className="text-sm text-muted-foreground">
          این مرورگر اعلان رومیزی را پشتیبانی نمی‌کند. صندوق اعلان‌ها همچنان کار می‌کند.
        </p>
      ) : null}
      {result === "denied" ? (
        <p className="text-sm text-muted-foreground">
          اعلان مرورگر رد شد. صندوق اعلان‌ها و نشان‌های نوار بالا همچنان کار می‌کنند.
        </p>
      ) : null}
      {result === "granted" ? (
        <p className="text-sm text-muted-foreground">اجازهٔ اعلان مرورگر ثبت شد.</p>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => void requestPermission()}>
          اجازهٔ اعلان مرورگر
        </Button>
      )}
    </div>
  );
}
