import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { safeCallbackUrl } from "../src/lib/validators/auth";

describe("safeCallbackUrl", () => {
  it("keeps a relative path", () => {
    assert.equal(safeCallbackUrl("/services/abc"), "/services/abc");
  });

  it("rejects protocol-relative, backslash, and encoded variants", () => {
    assert.equal(safeCallbackUrl("//evil.example"), "/");
    assert.equal(safeCallbackUrl("/\\evil.example"), "/");
    assert.equal(safeCallbackUrl("/%2F%2Fevil.example"), "/");
    assert.equal(safeCallbackUrl("/%5Cevil.example"), "/");
    assert.equal(safeCallbackUrl("https://evil.example"), "/");
    assert.equal(safeCallbackUrl(null), "/");
  });
});
