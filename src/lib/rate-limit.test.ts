import { afterEach, describe, expect, it, vi } from "vitest";
import { clientIp, rateLimit, refundLimit } from "./rate-limit";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("rateLimit", () => {
  it("blocks once the limit is reached within the window", () => {
    const key = `test-block:${Math.random()}`;
    expect(rateLimit(key, 2, 60_000).ok).toBe(true);
    expect(rateLimit(key, 2, 60_000).ok).toBe(true);
    const third = rateLimit(key, 2, 60_000);
    expect(third.ok).toBe(false);
    if (!third.ok) expect(third.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("frees a slot when a reserved attempt is refunded", () => {
    const key = `test-refund:${Math.random()}`;
    rateLimit(key, 1, 60_000);
    refundLimit(key);
    expect(rateLimit(key, 1, 60_000).ok).toBe(true);
  });
});

describe("clientIp", () => {
  const headers = new Headers({ "x-forwarded-for": "6.6.6.6, 10.0.0.2", "x-real-ip": "7.7.7.7" });

  it("ignores forwarding headers unless a proxy is trusted", () => {
    expect(clientIp(headers)).toBeNull();
  });

  it("uses the right-most forwarded entry behind a trusted proxy", () => {
    vi.stubEnv("TRUST_PROXY", "true");
    expect(clientIp(headers)).toBe("10.0.0.2");
  });

  it("uses the platform header on Vercel", () => {
    vi.stubEnv("VERCEL", "1");
    expect(clientIp(headers)).toBe("7.7.7.7");
  });
});
