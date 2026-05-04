import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(req);
    const { id } = await params;
    const body = await req.json() as { type?: string };
    const { type } = body;

    if (!['view', 'whatsapp'].includes(type ?? '')) {
      return NextResponse.json({ error: 'type invalide' }, { status: 400 });
    }

    const windowMs = type === 'view' ? 10 * 60 * 1000 : 5 * 60 * 1000;
    const rl = rateLimit(`track:${type}:${ip}:${id}`, 1, windowMs);
    if (!rl.ok) {
      return NextResponse.json({ ok: true });
    }

    await db.establishment.update({
      where: { id },
      data: type === 'view'
        ? { viewsCount: { increment: 1 } }
        : { clicksCount: { increment: 1 } },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
