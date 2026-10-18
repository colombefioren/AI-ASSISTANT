type Bucket = { hits: number[]; expiresAt: number };

const MAX_BUCKETS_PER_NAMESPACE = 10_000;
// One table per key prefix ("signin-fail", "register", ...), so flooding one
// kind of key can never exhaust the space another endpoint relies on.
const tables = new Map<string, Map<string, Bucket>>();

function tableFor(key: string) {
  const namespace = key.split(":", 1)[0];
  let table = tables.get(namespace);
  if (!table) {
    table = new Map();
    tables.set(namespace, table);
  }
  return table;
}

function sweep(table: Map<string, Bucket>, now: number) {
  for (const [key, bucket] of table) {
    if (bucket.expiresAt <= now) table.delete(key);
  }
}

function load(table: Map<string, Bucket>, key: string, windowMs: number, now: number) {
  const bucket = table.get(key);
  if (!bucket) return null;
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  return bucket;
}

export type LimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

/**
 * Records a hit for `key` and reports whether it stayed under `limit`.
 * Sliding window kept in process memory: fine for a single instance, swap for
 * Redis or Upstash when running several servers. Active buckets are never
 * evicted; when a namespace is full of live buckets, new keys in that
 * namespace fail closed while other namespaces keep working.
 */
export function rateLimit(key: string, limit: number, windowMs: number): LimitResult {
  const now = Date.now();
  const safeKey = key.slice(0, 200);
  const table = tableFor(safeKey);
  let bucket = load(table, safeKey, windowMs, now);

  if (!bucket) {
    if (table.size >= MAX_BUCKETS_PER_NAMESPACE) sweep(table, now);
    if (table.size >= MAX_BUCKETS_PER_NAMESPACE) {
      return { ok: false, retryAfterSeconds: Math.ceil(windowMs / 1000) };
    }
    bucket = { hits: [], expiresAt: 0 };
  }

  if (bucket.hits.length >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((windowMs - (now - bucket.hits[0])) / 1000) };
  }

  bucket.hits.push(now);
  bucket.expiresAt = now + windowMs;
  table.set(safeKey, bucket);
  return { ok: true };
}

/** Gives back the most recent hit, e.g. after a reserved attempt succeeded. */
export function refundLimit(key: string) {
  const safeKey = key.slice(0, 200);
  const table = tableFor(safeKey);
  const bucket = table.get(safeKey);
  if (!bucket) return;
  bucket.hits.pop();
  // Successful sign-ins should not leave buckets behind to fill the table.
  if (bucket.hits.length === 0) table.delete(safeKey);
}

const IP_PATTERN = /^[0-9a-fA-F:.]{2,45}$/;

/**
 * Client IP from proxy headers, or null when they cannot be trusted.
 * Forwarding headers are client-controlled unless infrastructure you run
 * rewrites them. On Vercel the platform sets x-real-ip. With TRUST_PROXY=true
 * only the right-most x-forwarded-for entry is used, the one your own proxy
 * appended; x-real-ip is ignored there because a client can send it.
 */
export function clientIp(headers: Headers | Record<string, string | string[] | undefined>) {
  const read = (name: string) => {
    if (headers instanceof Headers) return headers.get(name);
    const value = headers[name];
    return Array.isArray(value) ? value[0] : value;
  };

  let candidate: string | undefined;
  if (process.env.VERCEL === "1") {
    candidate = read("x-real-ip")?.trim();
  } else if (process.env.TRUST_PROXY === "true") {
    candidate = read("x-forwarded-for")?.split(",").map((part) => part.trim()).filter(Boolean).at(-1);
  }
  return candidate && IP_PATTERN.test(candidate) ? candidate : null;
}
