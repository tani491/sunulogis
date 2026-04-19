import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.room.findUnique({
      where: { id },
      include: { establishment: { select: { ownerId: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Chambre non trouvée' }, { status: 404 });
    }

    if (existing.establishment.ownerId !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await req.json();
    const { name, pricePerNight, capacity, isAvailable } = body;

    const room = await db.room.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(pricePerNight !== undefined && { pricePerNight: parseInt(pricePerNight) }),
        ...(capacity !== undefined && { capacity: parseInt(capacity) }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error('Update room error:', error);
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
      include: { establishment: { select: { ownerId: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Chambre non trouvée' }, { status: 404 });
    }

    if (existing.establishment.ownerId !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await db.room.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete room error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
