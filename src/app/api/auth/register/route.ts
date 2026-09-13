import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: 'Les inscriptions publiques sont désactivées sur SunuLogis.' },
    { status: 403 },
  );
}
