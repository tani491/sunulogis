import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, isAdminRole } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.booking.findUnique({
      where: { id },
      include: { room: { include: { establishment: { select: { ownerId: true } } } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
    }

    if (existing.room.establishment.ownerId !== user.id && !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await req.json();
    const { status } = body;

    if (!['confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    const booking = await db.booking.update({
      where: { id },
      data: { status },
      include: {
        room: { select: { id: true, name: true, establishment: { select: { id: true, name: true } } } },
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
