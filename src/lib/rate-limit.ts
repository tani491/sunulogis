type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

// Purge expired entries every 5 minutes to avoid unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000).unref?.();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Sliding-window in-memory rate limiter.
 * Suitable for single-process deployments (Vercel serverless: use Redis instead).
 */
export function rateLimit(
  key: string,
  max = 100,
  windowMs = 15 * 60 * 1000,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { ok: true, remaining: max - 1, resetAt };
  }

  entry.count += 1;
  const ok = entry.count <= max;
  const remaining = Math.max(0, max - entry.count);
  return { ok, remaining, resetAt: entry.resetAt };
}

export function getClientIp(req: Request): string {
  const forwarded = (req.headers as Headers).get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return (req.headers as Headers).get('x-real-ip') ?? 'unknown';
}

export function rateLimitResponse(resetAt: number): Response {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return new Response(
    JSON.stringify({ error: 'Trop de requêtes. Réessayez dans quelques minutes.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
      },
    },
  );
}
