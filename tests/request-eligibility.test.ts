import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  acceptedRequestError,
  ownServiceRequestError,
  requestEligibility,
} from "../src/lib/request-eligibility";

describe("requestEligibility", () => {
  it("allows a new request when the patient does not own the service and has no accepted request", () => {
    assert.deepEqual(requestEligibility({ ownsService: false, hasAccepted: false }), {
      ok: true,
    });
  });

  it("rejects the physician requesting their own service", () => {
    assert.deepEqual(requestEligibility({ ownsService: true, hasAccepted: false }), {
      ok: false,
      error: ownServiceRequestError,
    });
  });

  it("rejects another request after one was accepted", () => {
    assert.deepEqual(requestEligibility({ ownsService: false, hasAccepted: true }), {
      ok: false,
      error: acceptedRequestError,
    });
  });
});
