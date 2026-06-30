type RateLimitRecord = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

const globalRateLimit = globalThis as typeof globalThis & {
  __laleRateLimitStore?: Map<string, RateLimitRecord>;
};

function getStore() {
  if (!globalRateLimit.__laleRateLimitStore) {
    globalRateLimit.__laleRateLimitStore = new Map();
  }

  return globalRateLimit.__laleRateLimitStore;
}

export function getClientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function isRateLimited(key: string, options: RateLimitOptions) {
  const now = Date.now();
  const store = getStore();
  const record = store.get(key);

  if (!record || record.resetAt <= now) {
    store.delete(key);
    return { limited: false, retryAfterSeconds: 0 };
  }

  if (record.count >= options.limit) {
    return {
      limited: true,
      retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  return { limited: false, retryAfterSeconds: 0 };
}

export function recordFailedAttempt(key: string, options: RateLimitOptions) {
  const now = Date.now();
  const store = getStore();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return;
  }

  current.count += 1;
  store.set(key, current);
}

export function resetRateLimit(key: string) {
  getStore().delete(key);
}
