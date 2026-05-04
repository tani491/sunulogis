import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, isAdminRole } from '@/lib/auth';

function parsePrice(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.room.findUnique({
      where: { id },
      select: { establishment: { select: { ownerId: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Chambre non trouvée' }, { status: 404 });
    }

    if (existing.establishment.ownerId !== user.id && !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await req.json();
    const { name, pricePerNight, capacity, isAvailable } = body;

    if (pricePerNight !== undefined) {
      const price = parsePrice(pricePerNight);
      if (price === null) {
        return NextResponse.json({ error: 'Prix invalide' }, { status: 400 });
      }
    }

    if (capacity !== undefined) {
      const cap = parsePrice(capacity);
      if (cap === null || cap < 1) {
        return NextResponse.json({ error: 'Capacité invalide' }, { status: 400 });
      }
    }

    const room = await db.room.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(pricePerNight !== undefined && { pricePerNight: parsePrice(pricePerNight)! }),
        ...(capacity !== undefined && { capacity: parsePrice(capacity)! }),
        ...(isAvailable !== undefined && { isAvailable: Boolean(isAvailable) }),
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error('[ROOM_PUT_ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.room.findUnique({
      where: { id },
      select: { establishment: { select: { ownerId: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Chambre non trouvée' }, { status: 404 });
    }

    if (existing.establishment.ownerId !== user.id && !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await db.room.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ROOM_DELETE_ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
