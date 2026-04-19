import { createHash } from 'crypto';
import { cookies } from 'next/headers';
import { db } from './db';

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('ac_session');
  if (!session?.value) return null;

  try {
    const profile = await db.profile.findUnique({
      where: { id: session.value },
      select: { id: true, email: true, fullName: true, role: true, phone: true },
    });
    return profile;
  } catch {
    return null;
  }
}
