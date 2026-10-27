import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isCompletedVisit,
  serviceRequestTimelineTitle,
  sortTimeline,
  type TimelineEntry,
} from "../src/lib/care-timeline";
import {
  BROWSER_NOTIFICATION_BODY,
  BROWSER_NOTIFICATION_TITLE,
  isGenericBrowserCopy,
  latestStatus,
  notificationDedupeKey,
  notificationHref,
} from "../src/lib/notifications";
import { displayPatientName } from "../src/lib/patient-name";
import { parseTehranDateTime } from "../src/lib/tehran";
import { fullNameSchema } from "../src/lib/validators/auth";
import { registerBodySchema } from "../src/lib/validators/auth";

describe("fullNameSchema", () => {
  it("requires a trimmed non-empty name", () => {
    assert.equal(fullNameSchema.safeParse("").success, false);
    assert.equal(fullNameSchema.safeParse("   ").success, false);
    assert.equal(fullNameSchema.safeParse("Ali Rezaei").success, true);
  });
});

describe("registerBodySchema", () => {
  it("requires fullName with email and password", () => {
    const result = registerBodySchema.safeParse({
      email: "synthetic.patient@example.test",
      password: "Abcdef1!",
      confirmPassword: "Abcdef1!",
    });
    assert.equal(result.success, false);
    const ok = registerBodySchema.safeParse({
      fullName: "Ali Rezaei",
      email: "synthetic.patient@example.test",
      password: "Abcdef1!",
      confirmPassword: "Abcdef1!",
    });
    assert.equal(ok.success, true);
  });
});

describe("notification helpers", () => {
  it("keeps a relative href and rejects protocol-relative paths", () => {
    assert.equal(notificationHref("/care"), "/care");
    assert.equal(notificationHref("//evil.example"), "/");
  });

  it("builds a stable dedupe key", () => {
    assert.equal(
      notificationDedupeKey("reminder", "abc", "due"),
      "reminder:abc:due",
    );
  });

  it("keeps browser copy generic", () => {
    assert.equal(
      isGenericBrowserCopy(BROWSER_NOTIFICATION_TITLE, BROWSER_NOTIFICATION_BODY),
      true,
    );
    assert.equal(
      BROWSER_NOTIFICATION_BODY.includes("Amoxicillin"),
      false,
    );
  });
});

describe("latestStatus", () => {
  it("returns the newest event", () => {
    const latest = latestStatus([
      { occurredAt: new Date("2026-01-01T00:00:00Z"), status: "active" },
      { occurredAt: new Date("2026-02-01T00:00:00Z"), status: "discontinued" },
      { occurredAt: new Date("2026-01-15T00:00:00Z"), status: "completed" },
    ]);
    assert.equal(latest?.status, "discontinued");
  });
});

describe("care timeline", () => {
  it("does not treat a service request as a completed visit", () => {
    assert.equal(isCompletedVisit("service_request"), false);
    assert.equal(isCompletedVisit("prescription"), false);
    assert.equal(serviceRequestTimelineTitle("pending"), "درخواست رزرو در انتظار");
    assert.equal(serviceRequestTimelineTitle("cancelled"), "درخواست رزرو لغو شده");
  });

  it("orders newest first", () => {
    const entries: TimelineEntry[] = [
      {
        id: "a",
        at: new Date("2026-01-01"),
        kind: "reminder",
        title: "a",
        detail: "a",
        href: null,
      },
      {
        id: "b",
        at: new Date("2026-03-01"),
        kind: "prescription",
        title: "b",
        detail: "b",
        href: null,
      },
    ];
    assert.equal(sortTimeline(entries)[0]?.id, "b");
  });
});

describe("displayPatientName", () => {
  it("does not fall back to email or id", () => {
    assert.equal(displayPatientName(null), "نام ثبت نشده");
    assert.equal(displayPatientName("  "), "نام ثبت نشده");
    assert.equal(displayPatientName("Ali Rezaei"), "Ali Rezaei");
  });
});

describe("parseTehranDateTime", () => {
  it("parses a civil Tehran instant", () => {
    const parsed = parseTehranDateTime("2026-03-21", "09:30");
    assert.ok(parsed);
    assert.equal(parsed.toISOString(), "2026-03-21T06:00:00.000Z");
  });

  it("rejects invalid values", () => {
    assert.equal(parseTehranDateTime("21-03-2026", "09:30"), null);
  });
});
