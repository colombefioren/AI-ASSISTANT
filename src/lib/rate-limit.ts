type Bucket = { hits: number[]; expiresAt: number };

const MAX_BUCKETS = 10_000;
const buckets = new Map<string, Bucket>();

function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.expiresAt <= now) buckets.delete(key);
  }
}

function load(key: string, windowMs: number, now: number) {
  const bucket = buckets.get(key);
  if (!bucket) return null;
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  return bucket;
}

export type LimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

function blocked(bucket: Bucket, windowMs: number, now: number): LimitResult {
  return { ok: false, retryAfterSeconds: Math.ceil((windowMs - (now - bucket.hits[0])) / 1000) };
}

/** Returns whether `key` is still under `limit` without recording a hit. */
export function peekLimit(key: string, limit: number, windowMs: number): LimitResult {
  const now = Date.now();
  const bucket = load(key.slice(0, 200), windowMs, now);
  return bucket && bucket.hits.length >= limit ? blocked(bucket, windowMs, now) : { ok: true };
}

/**
 * Records a hit for `key` and reports whether it stayed under `limit`.
 * Sliding window kept in process memory: fine for a single instance, swap for
 * Redis or Upstash when running several servers. Active buckets are never
 * evicted; when the table is full of live buckets new keys fail closed.
 */
export function rateLimit(key: string, limit: number, windowMs: number): LimitResult {
  const now = Date.now();
  const safeKey = key.slice(0, 200);
  let bucket = load(safeKey, windowMs, now);

  if (!bucket) {
    if (buckets.size >= MAX_BUCKETS) sweep(now);
    if (buckets.size >= MAX_BUCKETS) return { ok: false, retryAfterSeconds: Math.ceil(windowMs / 1000) };
    bucket = { hits: [], expiresAt: 0 };
  }

  if (bucket.hits.length >= limit) return blocked(bucket, windowMs, now);

  bucket.hits.push(now);
  bucket.expiresAt = now + windowMs;
  buckets.set(safeKey, bucket);
  return { ok: true };
}

const IP_PATTERN = /^[0-9a-fA-F:.]{2,45}$/;

/**
 * Client IP from proxy headers, or null when they cannot be trusted.
 * Forwarding headers are client-controlled unless a proxy you run rewrites
 * them, so they are only read on Vercel (which sets x-real-ip) or when
 * TRUST_PROXY=true. Behind your own proxy the right-most x-forwarded-for entry
 * is the one it appended.
 */
export function clientIp(headers: Headers | Record<string, string | string[] | undefined>) {
  const trusted = process.env.VERCEL === "1" || process.env.TRUST_PROXY === "true";
  if (!trusted) return null;

  const read = (name: string) => {
    if (headers instanceof Headers) return headers.get(name);
    const value = headers[name];
    return Array.isArray(value) ? value[0] : value;
  };
  const candidate =
    read("x-real-ip")?.trim() ||
    read("x-forwarded-for")?.split(",").map((part) => part.trim()).filter(Boolean).at(-1);
  return candidate && IP_PATTERN.test(candidate) ? candidate : null;
}
