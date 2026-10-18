type Bucket = { hits: number[] };

const buckets = new Map<string, Bucket>();

/**
 * Sliding-window limiter kept in process memory. Good enough for a single
 * instance; swap for Redis or Upstash when running more than one server.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket);
    const retryAfterMs = windowMs - (now - bucket.hits[0]);
    return { ok: false as const, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { ok: true as const };
}

export function clientIp(headers: Headers | Record<string, string | string[] | undefined>) {
  const read = (name: string) => {
    if (headers instanceof Headers) return headers.get(name);
    const value = headers[name];
    return Array.isArray(value) ? value[0] : value;
  };
  return read("x-forwarded-for")?.split(",")[0]?.trim() || read("x-real-ip") || "unknown";
}
