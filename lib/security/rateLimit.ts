import { getSecurityConfig } from "./config";

export type RateLimitResult =
  | { allowed: true; remaining: number; resetAt: number }
  | { allowed: false; remaining: 0; resetAt: number; retryAfterSec: number };

type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();
const inFlight = new Map<string, number>();

function pruneStale(now: number, windowMs: number): void {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > windowMs * 2) {
      buckets.delete(key);
    }
  }
}

export function checkRateLimit(key: string, now = Date.now()): RateLimitResult {
  const config = getSecurityConfig();

  if (config.disableRateLimit) {
    return { allowed: true, remaining: config.maxActionsPerWindow, resetAt: now + config.windowMs };
  }

  pruneStale(now, config.windowMs);

  let bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart >= config.windowMs) {
    bucket = { count: 0, windowStart: now };
    buckets.set(key, bucket);
  }

  const resetAt = bucket.windowStart + config.windowMs;
  const remaining = Math.max(0, config.maxActionsPerWindow - bucket.count);

  if (bucket.count >= config.maxActionsPerWindow) {
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfterSec: Math.max(1, Math.ceil((resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: remaining - 1,
    resetAt,
  };
}

export function acquireConcurrentSlot(ip: string): boolean {
  const config = getSecurityConfig();
  if (config.disableRateLimit) return true;

  const current = inFlight.get(ip) ?? 0;
  if (current >= config.maxConcurrentPerIp) return false;
  inFlight.set(ip, current + 1);
  return true;
}

export function releaseConcurrentSlot(ip: string): void {
  const current = inFlight.get(ip) ?? 0;
  if (current <= 1) {
    inFlight.delete(ip);
  } else {
    inFlight.set(ip, current - 1);
  }
}

/** Test helper */
export function resetRateLimitState(): void {
  buckets.clear();
  inFlight.clear();
}
