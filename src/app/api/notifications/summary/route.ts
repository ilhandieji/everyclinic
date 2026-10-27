import { NextResponse } from "next/server";
import { connection } from "next/server";
import { loadNotificationSummary } from "@/lib/notification-summary";

export async function GET() {
  await connection();
  const summary = await loadNotificationSummary();
  return NextResponse.json(summary);
}
