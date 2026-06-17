type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();
const REDIS_KEY_PREFIX = 'sunulogis:rate-limit:';

const redisScript = `
local current = redis.call("INCR", KEYS[1])
local ttl = redis.call("PTTL", KEYS[1])
if ttl < 0 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return { current, ttl }
`;

// Purge expired entries every 5 minutes to avoid unbounded memory growth.
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

function getRedisRestConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;
  return { url, token };
}

async function distributedRateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult | null> {
  const config = getRedisRestConfig();
  if (!config) return null;

  try {
    const res = await fetch(config.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        'EVAL',
        redisScript,
        '1',
        `${REDIS_KEY_PREFIX}${key}`,
        String(windowMs),
      ]),
      signal: AbortSignal.timeout(1500),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as { result?: unknown; error?: string };
    if (data.error || !Array.isArray(data.result)) return null;

    const count = Number(data.result[0]);
    const ttl = Number(data.result[1]);
    if (!Number.isFinite(count) || !Number.isFinite(ttl)) return null;

    return {
      ok: count <= max,
      remaining: Math.max(0, max - count),
      resetAt: Date.now() + Math.max(0, ttl),
    };
  } catch {
    return null;
  }
}

/**
 * Fixed-window in-memory rate limiter.
 * Useful as a local fallback. On Vercel, prefer rateLimitAsync with KV/Upstash
 * environment variables so limits are shared across serverless instances.
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

export async function rateLimitAsync(
  key: string,
  max = 100,
  windowMs = 15 * 60 * 1000,
): Promise<RateLimitResult> {
  const distributed = await distributedRateLimit(key, max, windowMs);
  return distributed ?? rateLimit(key, max, windowMs);
}

export function getClientIp(req: Request): string {
  const forwarded = (req.headers as Headers).get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return (req.headers as Headers).get('x-real-ip') ?? 'unknown';
}

export function rateLimitResponse(resetAt: number, limit = 100): Response {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));

  return new Response(
    JSON.stringify({ error: 'Trop de requetes. Reessayez dans quelques minutes.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '0',
      },
    },
  );
}
