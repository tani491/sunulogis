import bcrypt from 'bcryptjs';
import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { db } from './db';

const BCRYPT_ROUNDS = 12;

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET env variable is required in production');
  }
  return s ?? 'dev-only-secret-replace-in-production';
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

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
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;
  } catch {
    return null;
  }

  const firstDot = payload.indexOf('.');
  if (firstDot === -1) return null;
  return payload.slice(0, firstDot);
}

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('ac_session');
    if (!session?.value) return null;

    const userId = verifySessionToken(session.value);
    if (!userId) return null;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        isSubscribed: true,
      },
    });

    if (!user || !user.isActive) return null;

    return {
      id: user.id,
      email: user.email,
      fullName: user.name,
      role: user.role,
      phone: user.phone,
      isSubscribed: user.isSubscribed,
    };
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
    maxAge: 60 * 60 * 24,
    path: '/',
  };
}

export function getExpiredCookieOptions() {
  return { ...getCookieOptions(), maxAge: 0 };
}
