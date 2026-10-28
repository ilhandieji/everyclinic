import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bookingWindowBookable,
  receptionDayStatus,
  timeToMinutes,
  windowContainsTime,
  windowsOverlap,
} from "../src/lib/booking-windows";
import {
  addBookingWindowSchema,
  copyBookingWindowsSchema,
  requestFormWithWindowSchema,
} from "../src/lib/validators/booking";
import {
  addCivilDays,
  civilToUtcDate,
  parseTehranDateTime,
  utcDateToCivil,
} from "../src/lib/tehran";
import { civilRange } from "../src/lib/booking-windows";

describe("booking window helpers", () => {
  it("converts HH:mm to minutes", () => {
    assert.equal(timeToMinutes("07:00"), 420);
    assert.equal(timeToMinutes("14:00"), 840);
    assert.equal(timeToMinutes("24:00"), null);
  });

  it("detects overlapping half-open ranges", () => {
    assert.equal(
      windowsOverlap(
        { startTime: "07:00", endTime: "14:00" },
        { startTime: "15:00", endTime: "20:00" },
      ),
      false,
    );
    assert.equal(
      windowsOverlap(
        { startTime: "07:00", endTime: "14:00" },
        { startTime: "13:00", endTime: "16:00" },
      ),
      true,
    );
    assert.equal(
      windowsOverlap(
        { startTime: "07:00", endTime: "14:00" },
        { startTime: "14:00", endTime: "16:00" },
      ),
      false,
    );
  });

  it("checks whether an exact time sits inside a window", () => {
    const window = { startTime: "07:00", endTime: "14:00" };
    assert.equal(windowContainsTime(window, "07:00"), true);
    assert.equal(windowContainsTime(window, "13:59"), true);
    assert.equal(windowContainsTime(window, "14:00"), false);
    assert.equal(windowContainsTime(window, "15:00"), false);
  });

  it("keeps an unset reception day distinct from a closed day", () => {
    assert.equal(
      receptionDayStatus({ exists: false, closed: false, windowCount: 0 }),
      "undeclared",
    );
    assert.equal(
      receptionDayStatus({ exists: true, closed: false, windowCount: 0 }),
      "undeclared",
    );
    assert.equal(
      receptionDayStatus({ exists: true, closed: true, windowCount: 0 }),
      "closed",
    );
    assert.equal(
      receptionDayStatus({ exists: true, closed: true, windowCount: 2 }),
      "closed",
    );
    assert.equal(
      receptionDayStatus({ exists: true, closed: false, windowCount: 1 }),
      "open",
    );
  });

  it("rejects closed, taken, or ended windows", () => {
    assert.equal(bookingWindowBookable({ closed: true, taken: false, windowEnded: false }).ok, false);
    assert.equal(bookingWindowBookable({ closed: false, taken: true, windowEnded: false }).ok, false);
    assert.equal(bookingWindowBookable({ closed: false, taken: false, windowEnded: true }).ok, false);
    assert.deepEqual(
      bookingWindowBookable({ closed: false, taken: false, windowEnded: false }),
      { ok: true },
    );
  });
});

describe("booking validators", () => {
  it("requires end after start", () => {
    const bad = addBookingWindowSchema.safeParse({
      date: "2026-10-27",
      startTime: "14:00",
      endTime: "07:00",
    });
    assert.equal(bad.success, false);
    const good = addBookingWindowSchema.safeParse({
      date: "2026-10-27",
      startTime: "07:00",
      endTime: "14:00",
    });
    assert.equal(good.success, true);
  });

  it("rejects a copy range longer than the allowed span", () => {
    const parsed = copyBookingWindowsSchema.safeParse({
      sourceDate: "2026-10-27",
      startDate: "2026-10-28",
      endDate: "2027-01-01",
    });
    assert.equal(parsed.success, false);
  });

  it("requires a booking window on a service request", () => {
    const parsed = requestFormWithWindowSchema.safeParse({
      serviceId: "svc1",
      note: "",
      bookingWindowId: "",
    });
    assert.equal(parsed.success, false);
  });
});

describe("civil dates", () => {
  it("round-trips DATE values through UTC midnight", () => {
    const civil = "2026-11-10";
    const utc = civilToUtcDate(civil);
    assert.ok(utc);
    assert.equal(utcDateToCivil(utc), civil);
  });

  it("parses Tehran civil times for booking labels", () => {
    const instant = parseTehranDateTime("2026-11-01", "07:00");
    assert.ok(instant);
    assert.equal(instant.toISOString(), "2026-11-01T03:30:00.000Z");
  });

  it("builds an inclusive civil range", () => {
    assert.deepEqual(civilRange("2026-10-27", "2026-10-29"), [
      "2026-10-27",
      "2026-10-28",
      "2026-10-29",
    ]);
    assert.equal(addCivilDays("2026-10-27", 7), "2026-11-03");
  });
});
