import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, isAdminRole } from '@/lib/auth';

function parsePrice(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const establishmentId = searchParams.get('establishmentId');

    const user = await getSessionUser();

    if (user && user.role === 'owner') {
      const rooms = await db.room.findMany({
        where: {
          ...(establishmentId ? { establishmentId } : {}),
          establishment: { ownerId: user.id },
        },
        include: { establishment: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(rooms);
    }

    if (user && isAdminRole(user.role)) {
      const rooms = await db.room.findMany({
        where: { ...(establishmentId ? { establishmentId } : {}) },
        include: { establishment: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(rooms);
    }

    const rooms = await db.room.findMany({
      where: {
        isAvailable: true,
        ...(establishmentId ? { establishmentId } : {}),
        establishment: { isApproved: true, isSuspended: false },
      },
      select: {
        id: true,
        name: true,
        pricePerNight: true,
        capacity: true,
        isAvailable: true,
        establishmentId: true,
        establishment: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('[ROOMS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { establishmentId, name, pricePerNight, capacity } = body;

    if (!establishmentId || !name || pricePerNight === undefined) {
      return NextResponse.json({ error: 'Champ requis manquant' }, { status: 400 });
    }

    const price = parsePrice(pricePerNight);
    if (price === null) {
      return NextResponse.json({ error: 'Prix invalide' }, { status: 400 });
    }

    const establishment = await db.establishment.findUnique({
      where: { id: establishmentId },
      select: { ownerId: true },
    });
    if (!establishment || (establishment.ownerId !== user.id && !isAdminRole(user.role))) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const room = await db.room.create({
      data: {
        establishmentId,
        name,
        pricePerNight: price,
        capacity: parsePrice(capacity) ?? 1,
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error('[ROOMS_POST_ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
