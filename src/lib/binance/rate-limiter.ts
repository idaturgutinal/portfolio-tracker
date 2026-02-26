interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Prune expired entries every 60 seconds
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 60_000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterMs: number;
}

/**
 * Check if a request is within rate limits.
 * @param key - Unique identifier (e.g. IP, userId)
 * @param maxRequests - Maximum number of requests in the window
 * @param windowMs - Window duration in milliseconds
 */
export function checkLimit(key: string, maxRequests: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt, retryAfterMs: 0 };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterMs: entry.resetAt - now,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
    retryAfterMs: 0,
  };
}

// ── Preset limits ────────────────────────────────────────────────────────────

const ONE_MINUTE = 60_000;

/** Public routes: 60 requests per minute per IP */
export function checkPublicRateLimit(ip: string): RateLimitResult {
  return checkLimit(`binance:public:${ip}`, 60, ONE_MINUTE);
}

/** Signed routes: 30 requests per minute per user */
export function checkUserRateLimit(userId: string): RateLimitResult {
  return checkLimit(`binance:user:${userId}`, 30, ONE_MINUTE);
}

/** Order creation: 10 orders per minute per user */
export function checkOrderRateLimit(userId: string): RateLimitResult {
  return checkLimit(`binance:order:${userId}`, 10, ONE_MINUTE);
}
