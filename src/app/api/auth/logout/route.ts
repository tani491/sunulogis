import { NextResponse } from 'next/server';
import { getCookieOptions } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('ac_session', '', {
    ...getCookieOptions(),
    maxAge: 0,
  });
  return response;
}
