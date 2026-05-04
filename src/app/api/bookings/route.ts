import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

export async function GET(_req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const bookings = await db.booking.findMany({
      where: {
        room: {
          establishment: { ownerId: user.id },
        },
      },
      select: {
        id: true,
        guestName: true,
        guestPhone: true,
        startDate: true,
        endDate: true,
        status: true,
        createdAt: true,
        room: {
          select: {
            id: true,
            name: true,
            establishment: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('[BOOKINGS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`booking:${ip}`, 10, 60 * 60 * 1000);
  if (!rl.ok) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();
    const { roomId, guestName, guestPhone, startDate, endDate } = body;

    if (!roomId || !guestName || !guestPhone || !startDate || !endDate) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 });
    }

    if (typeof roomId !== 'string' || typeof guestName !== 'string' || typeof guestPhone !== 'string') {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Dates invalides' }, { status: 400 });
    }

    if (start >= end) {
      return NextResponse.json(
        { error: "La date de départ doit être après la date d'arrivée" },
        { status: 400 }
      );
    }

    if (start < new Date()) {
      return NextResponse.json({ error: "La date d'arrivée ne peut pas être dans le passé" }, { status: 400 });
    }

    const room = await db.room.findUnique({
      where: { id: roomId },
      select: { id: true, isAvailable: true },
    });

    if (!room || !room.isAvailable) {
      return NextResponse.json({ error: 'Chambre non disponible' }, { status: 400 });
    }

    const booking = await db.booking.create({
      data: { roomId, guestName, guestPhone, startDate: start, endDate: end, status: 'pending' },
      select: {
        id: true,
        guestName: true,
        startDate: true,
        endDate: true,
        status: true,
        room: {
          select: {
            id: true,
            name: true,
            pricePerNight: true,
            establishment: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('[BOOKINGS_POST_ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
