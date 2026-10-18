type Bucket = { hits: number[]; expiresAt: number };

const MAX_BUCKETS = 10_000;
const buckets = new Map<string, Bucket>();

function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.expiresAt <= now) buckets.delete(key);
  }
  // Still full after removing expired entries: drop the oldest insertions.
  while (buckets.size >= MAX_BUCKETS) {
    const oldest = buckets.keys().next().value;
    if (oldest === undefined) break;
    buckets.delete(oldest);
  }
}

/**
 * Sliding-window limiter kept in process memory. Good enough for a single
 * instance; swap for Redis or Upstash when running more than one server.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const safeKey = key.slice(0, 200);
  if (buckets.size >= MAX_BUCKETS) sweep(now);

  const bucket = buckets.get(safeKey) ?? { hits: [], expiresAt: now + windowMs };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= limit) {
    buckets.set(safeKey, bucket);
    const retryAfterMs = windowMs - (now - bucket.hits[0]);
    return { ok: false as const, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }

  bucket.hits.push(now);
  bucket.expiresAt = now + windowMs;
  buckets.set(safeKey, bucket);
  return { ok: true as const };
}

const IP_PATTERN = /^[0-9a-fA-F:.]{2,45}$/;

/**
 * Prefers the platform-set x-real-ip header, then the right-most
 * x-forwarded-for entry (the one appended by the closest proxy), since the
 * left-most entries are client-controlled and trivially spoofed.
 */
export function clientIp(headers: Headers | Record<string, string | string[] | undefined>) {
  const read = (name: string) => {
    if (headers instanceof Headers) return headers.get(name);
    const value = headers[name];
    return Array.isArray(value) ? value[0] : value;
  };
  const candidate =
    read("x-real-ip")?.trim() ||
    read("x-forwarded-for")?.split(",").map((part) => part.trim()).filter(Boolean).at(-1);
  return candidate && IP_PATTERN.test(candidate) ? candidate : "unknown";
}
