import { describe, expect, it, beforeEach } from "vitest";
import { getClientIp, isIpBlocked } from "../lib/security/clientIp";
import {
  acquireConcurrentSlot,
  checkRateLimit,
  releaseConcurrentSlot,
  resetRateLimitState,
} from "../lib/security/rateLimit";
import { validateBrief, validateIntent } from "../lib/security/validateInput";
import { ValidationError } from "../lib/security/errors";

describe("security rateLimit", () => {
  beforeEach(() => {
    resetRateLimitState();
    process.env.TRUST_RECEIPT_DISABLE_RATE_LIMIT = "false";
    process.env.TRUST_RECEIPT_RATE_LIMIT_ACTIONS = "3";
    process.env.TRUST_RECEIPT_RATE_LIMIT_WINDOW_MS = "60000";
  });

  it("allows requests under the limit", () => {
    const r1 = checkRateLimit("test-ip");
    const r2 = checkRateLimit("test-ip");
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
  });

  it("blocks when limit exceeded", () => {
    checkRateLimit("test-ip");
    checkRateLimit("test-ip");
    checkRateLimit("test-ip");
    const blocked = checkRateLimit("test-ip");
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.retryAfterSec).toBeGreaterThan(0);
    }
  });

  it("limits concurrent slots per IP", () => {
    process.env.TRUST_RECEIPT_MAX_CONCURRENT = "1";
    expect(acquireConcurrentSlot("c-ip")).toBe(true);
    expect(acquireConcurrentSlot("c-ip")).toBe(false);
    releaseConcurrentSlot("c-ip");
    expect(acquireConcurrentSlot("c-ip")).toBe(true);
    releaseConcurrentSlot("c-ip");
  });
});

describe("security clientIp", () => {
  it("reads first x-forwarded-for hop", () => {
    const ip = getClientIp({
      get: (name) => (name === "x-forwarded-for" ? "203.0.113.1, 10.0.0.1" : null),
    });
    expect(ip).toBe("203.0.113.1");
  });

  it("detects blocked IPs", () => {
    expect(isIpBlocked("1.2.3.4", ["1.2.3.4"])).toBe(true);
    expect(isIpBlocked("5.6.7.8", ["1.2.3.4"])).toBe(false);
  });
});

describe("security validateInput", () => {
  it("rejects empty brief", () => {
    expect(() => validateBrief("   ")).toThrow(ValidationError);
  });

  it("accepts valid brief and intent", () => {
    expect(validateBrief("Launch post for Acme")).toBe("Launch post for Acme");
    expect(validateIntent("Drive signups")).toBe("Drive signups");
  });
});
