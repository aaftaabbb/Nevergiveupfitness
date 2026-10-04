/**
 * In-memory sliding-window rate limiter.
 *
 * Deliberately process-local: the login form is the only thing being throttled
 * and a free-tier deployment has no shared store to count against. It still
 * stops credential stuffing against a single warm instance, which is the
 * realistic case for a single-owner admin login.
 */
type Bucket = { hits: number[] };

const buckets = new Map<string, Bucket>();

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

// Keeps the map from growing without bound across a long-running process.
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    bucket.hits = bucket.hits.filter((at) => now - at < DEFAULT_WINDOW_MS);
    if (bucket.hits.length === 0) buckets.delete(key);
  }
}

/**
 * Counts hits for `key` inside a sliding window. `windowMs` is per call site so
 * the login form and the public enquiry form can use different budgets.
 */
export function rateLimit(key: string, limit = MAX_ATTEMPTS, windowMs = DEFAULT_WINDOW_MS) {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((at) => now - at < windowMs);

  if (bucket.hits.length >= limit) {
    const retryAfterSeconds = Math.ceil((windowMs - (now - bucket.hits[0])) / 1000);
    buckets.set(key, bucket);
    return { allowed: false as const, retryAfterSeconds };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { allowed: true as const, retryAfterSeconds: 0 };
}

export function clearRateLimit(key: string) {
  buckets.delete(key);
}

/** Best-effort client IP from proxy headers; falls back to an unknown bucket. */
export function clientKeyFromHeaders(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
  return ip;
}
