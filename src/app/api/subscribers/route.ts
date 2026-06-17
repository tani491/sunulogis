import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, isAdminRole } from '@/lib/auth';
import { getClientIp, rateLimitAsync, rateLimitResponse } from '@/lib/rate-limit';

// POST - Subscribe to newsletter (public)
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = await rateLimitAsync(`newsletter:${ip}`, 8, 15 * 60 * 1000);
  if (!rl.ok) return rateLimitResponse(rl.resetAt, 8);

  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const source = typeof body.source === 'string' ? body.source.trim().slice(0, 50) : 'footer';

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    const existing = await db.subscriber.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: 'Déjà inscrit à la newsletter', alreadySubscribed: true });
    }

    const subscriber = await db.subscriber.create({
      data: { email, consentStatus: true, source },
    });

    return NextResponse.json({ message: 'Inscription réussie !', subscriber });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// GET - List all subscribers (admin only)
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const subscribers = await db.subscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error('Subscribers list error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Remove a subscriber (admin only)
export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    await db.subscriber.delete({ where: { id } });
    return NextResponse.json({ message: 'Abonné supprimé' });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
