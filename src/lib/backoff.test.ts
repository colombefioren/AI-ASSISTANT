import { describe, expect, it } from "vitest";
import { cancelAttempt, finishAttempt, startAttempt, type BackoffPolicy } from "./backoff";

const policy: BackoffPolicy = { freeAttempts: 3, maxDelayMs: 8_000, resetAfterMs: 60_000 };
const key = () => `test:${Math.random()}`;

function fail(k: string, now: number) {
  const attempt = startAttempt(k, policy, now);
  if (attempt.ok) finishAttempt(k, false, policy, now);
  return attempt;
}

describe("sign-in backoff", () => {
  it("allows the free attempts back to back", () => {
    const k = key();
    for (let i = 0; i < 3; i++) expect(fail(k, 1_000).ok).toBe(true);
  });

  it("delays exponentially after the free attempts and caps the wait", () => {
    const k = key();
    let now = 0;
    for (let i = 0; i < 3; i++) fail(k, now);
    const waits: number[] = [];
    for (let i = 0; i < 5; i++) {
      const blocked = startAttempt(k, policy, now);
      expect(blocked.ok).toBe(false);
      if (!blocked.ok) waits.push(blocked.retryAfterSeconds);
      now += (blocked.ok ? 0 : blocked.retryAfterSeconds) * 1000;
      expect(fail(k, now).ok).toBe(true);
    }
    expect(waits).toEqual([1, 2, 4, 8, 8]);
  });

  it("never blocks longer than the maximum delay", () => {
    const k = key();
    let now = 0;
    for (let i = 0; i < 40; i++) {
      const attempt = fail(k, now);
      if (!attempt.ok) {
        expect(attempt.retryAfterSeconds).toBeLessThanOrEqual(8);
        now += attempt.retryAfterSeconds * 1000;
      }
    }
  });

  it("forgets failures after a successful sign-in", () => {
    const k = key();
    for (let i = 0; i < 4; i++) fail(k, 0);
    const later = 20_000;
    expect(startAttempt(k, policy, later).ok).toBe(true);
    finishAttempt(k, true, policy, later);
    for (let i = 0; i < 3; i++) expect(fail(k, later).ok).toBe(true);
  });

  it("counts in-flight attempts so parallel requests cannot skip the delay", () => {
    const k = key();
    const results = Array.from({ length: 6 }, () => startAttempt(k, policy, 0).ok);
    expect(results.filter(Boolean).length).toBe(4);
  });

  it("does not count cancelled attempts as failures", () => {
    const k = key();
    for (let i = 0; i < 10; i++) {
      expect(startAttempt(k, policy, 0).ok).toBe(true);
      cancelAttempt(k);
    }
  });

  it("forgets failures after the quiet period", () => {
    const k = key();
    for (let i = 0; i < 6; i++) fail(k, 0);
    expect(startAttempt(k, policy, 61_000).ok).toBe(true);
  });
});
