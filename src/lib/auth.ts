import { createHash } from 'crypto';
import { cookies } from 'next/headers';
import { db } from './db';

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('ac_session');
    if (!session?.value) return null;

    const profile = await db.profile.findUnique({
      where: { id: session.value },
      select: { id: true, email: true, fullName: true, role: true, phone: true },
    });
    return profile;
  } catch {
    return null;
  }
}

// Cookie options factory - secure in production
export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  };
}
