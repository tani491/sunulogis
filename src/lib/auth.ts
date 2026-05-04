import bcrypt from 'bcryptjs';
import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { db } from './db';

const BCRYPT_ROUNDS = 12;

// SESSION_SECRET must be set in production via environment variable.
// Generate one with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
// Evaluated lazily so `next build` does not throw at module load time.
function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET env variable is required in production');
  }
  return s ?? 'dev-only-secret-replace-in-production';
}

// ── Password helpers ──────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── HMAC-signed session token ─────────────────────────────────────────────────
// Format: <userId>.<issuedAt>.<hmac-sha256>
// Prevents cookie forgery: knowing a userId alone is not enough to forge a session.

export function createSessionToken(userId: string): string {
  const secret = getSecret();
  const issuedAt = Date.now().toString(36);
  const payload = `${userId}.${issuedAt}`;
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string): string | null {
  const lastDot = token.lastIndexOf('.');
  if (lastDot === -1) return null;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);

  const expected = createHmac('sha256', getSecret()).update(payload).digest('hex');
  try {
    const sigBuf = Buffer.from(sig, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    // Constant-time comparison to prevent timing attacks
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;
  } catch {
    return null;
  }

  // payload is "<userId>.<issuedAt>" — extract userId (may itself contain dots for UUID)
  const firstDot = payload.indexOf('.');
  if (firstDot === -1) return null;
  return payload.slice(0, firstDot);
}

// ── Session helpers ───────────────────────────────────────────────────────────

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('ac_session');
    if (!session?.value) return null;

    const userId = verifySessionToken(session.value);
    if (!userId) return null;

    const profile = await db.profile.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, role: true, phone: true, isSubscribed: true },
    });

    if (profile?.role === 'admin') {
      await db.profile.update({ where: { id: profile.id }, data: { role: 'admin' } });
      return { ...profile, role: 'admin' };
    }

    return profile;
  } catch {
    return null;
  }
}

export function isAdminRole(role: string | null | undefined): boolean {
  return role === 'admin';
}

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    // 24-hour session (was 7 days — reduced to limit exposure window)
    maxAge: 60 * 60 * 24,
    path: '/',
  };
}

/** Return cookie options that immediately expire the session cookie. */
export function getExpiredCookieOptions() {
  return { ...getCookieOptions(), maxAge: 0 };
}
