import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { displayPrices, priceToNumber } from "../src/lib/money";

describe("priceToNumber", () => {
  it("converts a bigint inside the written bound", () => {
    assert.equal(priceToNumber(BigInt(3000000000)), 3000000000);
    assert.deepEqual(displayPrices({ priceMin: BigInt(3000000000), priceMax: null }), {
      priceMin: 3000000000,
      priceMax: null,
    });
  });

  it("rejects a bigint above the written bound", () => {
    assert.throws(() => priceToNumber(BigInt("1000000000001")));
  });
});
