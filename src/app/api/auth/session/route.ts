import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(null);
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(null);
  }
}
