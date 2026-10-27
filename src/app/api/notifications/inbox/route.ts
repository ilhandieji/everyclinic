import { NextResponse } from "next/server";
import { connection } from "next/server";
import { loadNotificationInbox } from "@/lib/notification-inbox";

export async function GET() {
  await connection();
  const items = await loadNotificationInbox();
  return NextResponse.json({ items });
}
