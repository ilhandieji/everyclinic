import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isImageKey, sniffImage } from "../src/lib/storage";

describe("image keys and sniffing", () => {
  it("rejects path traversal and short keys", () => {
    assert.equal(isImageKey("../secret.png"), false);
    assert.equal(isImageKey("a.png"), false);
    assert.equal(isImageKey(`${"a".repeat(24)}.jpg`), true);
    assert.equal(isImageKey(`${"a".repeat(24)}.gif`), false);
  });

  it("recognizes jpeg, png, and webp magic bytes", () => {
    assert.equal(sniffImage(Uint8Array.of(0xff, 0xd8, 0xff, 0x00)), "jpg");
    assert.equal(
      sniffImage(Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)),
      "png",
    );
    const webp = new Uint8Array(12);
    webp.set([0x52, 0x49, 0x46, 0x46], 0);
    webp.set([0x57, 0x45, 0x42, 0x50], 8);
    assert.equal(sniffImage(webp), "webp");
    assert.equal(sniffImage(Uint8Array.of(0x00, 0x01)), null);
  });
});
