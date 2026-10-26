import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { serviceFormSchema } from "../src/lib/validators/site";

function form(overrides: Record<string, unknown> = {}) {
  return {
    title: "ویزیت",
    description: "توضیح خدمت",
    priceMin: "",
    priceMax: "",
    currencyLabel: "",
    published: false,
    sortOrder: 0,
    sections: [],
    ...overrides,
  };
}

describe("serviceFormSchema prices", () => {
  it("accepts a price above the 32-bit integer limit and at the written bound", () => {
    const parsed = serviceFormSchema.safeParse(
      form({
        priceMin: "3000000000",
        priceMax: "1000000000000",
        currencyLabel: "ریال",
      }),
    );
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.priceMin, 3000000000);
      assert.equal(parsed.data.priceMax, 1000000000000);
    }
  });

  it("rejects a price above the written bound", () => {
    const parsed = serviceFormSchema.safeParse(
      form({
        priceMin: "1000000000001",
        priceMax: "1000000000001",
        currencyLabel: "ریال",
      }),
    );
    assert.equal(parsed.success, false);
  });

  it("requires both bounds together and a currency when a price is set", () => {
    const oneSide = serviceFormSchema.safeParse(form({ priceMin: "10", priceMax: "" }));
    const noCurrency = serviceFormSchema.safeParse(
      form({ priceMin: "10", priceMax: "20", currencyLabel: "" }),
    );
    const reversed = serviceFormSchema.safeParse(
      form({ priceMin: "20", priceMax: "10", currencyLabel: "تومان" }),
    );
    assert.equal(oneSide.success, false);
    assert.equal(noCurrency.success, false);
    assert.equal(reversed.success, false);
  });
});
