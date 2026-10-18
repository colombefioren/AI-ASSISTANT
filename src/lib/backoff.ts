/**
 * Per-key exponential backoff for failed sign-ins. Unlike a hard limit it never
 * locks an account for long: after `freeAttempts` failures each further attempt
 * must wait 1s, 2s, 4s... up to `maxDelayMs`, which keeps password guessing
 * slow while the real owner is delayed by seconds at most.
 *
 * State lives in process memory, like rate-limit.ts. When the table is full the
 * least recently used entry is dropped; the worst case is that one key regains
 * its free attempts, which never blocks anyone.
 */

type Entry = { failures: number; pending: number; nextAllowedAt: number; expiresAt: number };

export interface BackoffPolicy {
  freeAttempts: number;
  maxDelayMs: number;
  /** Failures are forgotten after this much quiet time. */
  resetAfterMs: number;
}

const MAX_ENTRIES = 10_000;
const entries = new Map<string, Entry>();

function delayFor(count: number, policy: BackoffPolicy) {
  const over = count - policy.freeAttempts;
  return over < 0 ? 0 : Math.min(1000 * 2 ** over, policy.maxDelayMs);
}

function touch(key: string, entry: Entry) {
  // Re-inserting keeps Map order as least-recently-used first.
  entries.delete(key);
  entries.set(key, entry);
  while (entries.size > MAX_ENTRIES) {
    const oldest = entries.keys().next().value;
    if (oldest === undefined) break;
    entries.delete(oldest);
  }
}

export type BackoffResult = { ok: true } | { ok: false; retryAfterSeconds: number };

/**
 * Starts an attempt. Must be paired with `finishAttempt`. In-flight attempts
 * count as failures until they finish, so parallel requests cannot skip the
 * queue, and once past the free attempts each allowed attempt reserves the
 * next delay up front.
 */
export function startAttempt(key: string, policy: BackoffPolicy, now = Date.now()): BackoffResult {
  const safeKey = key.slice(0, 200);
  let entry = entries.get(safeKey);
  if (entry && entry.expiresAt <= now && entry.pending === 0) entry = undefined;
  entry ??= { failures: 0, pending: 0, nextAllowedAt: 0, expiresAt: 0 };

  if (now < entry.nextAllowedAt) {
    return { ok: false, retryAfterSeconds: Math.ceil((entry.nextAllowedAt - now) / 1000) };
  }

  const delay = delayFor(entry.failures + entry.pending, policy);
  if (delay > 0) entry.nextAllowedAt = now + delay;
  entry.pending += 1;
  entry.expiresAt = now + policy.resetAfterMs;
  touch(safeKey, entry);
  return { ok: true };
}

/** Ends an attempt; a success clears the key's history. */
export function finishAttempt(key: string, succeeded: boolean, policy: BackoffPolicy, now = Date.now()) {
  const safeKey = key.slice(0, 200);
  const entry = entries.get(safeKey);
  if (!entry) return;
  entry.pending = Math.max(0, entry.pending - 1);

  if (succeeded) {
    if (entry.pending === 0) entries.delete(safeKey);
    else entry.failures = 0;
    return;
  }

  entry.failures += 1;
  entry.nextAllowedAt = Math.max(entry.nextAllowedAt, now + delayFor(entry.failures, policy));
  entry.expiresAt = now + policy.resetAfterMs;
  touch(safeKey, entry);
}

/** Ends an attempt that never reached the password check, without counting it. */
export function cancelAttempt(key: string) {
  const entry = entries.get(key.slice(0, 200));
  if (entry) entry.pending = Math.max(0, entry.pending - 1);
}
