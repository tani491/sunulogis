import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const status = searchParams.get('status');

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Get all hostels owned by user
    const userHostels = await db.hostel.findMany({
      where: { ownerId: user.id },
      select: { id: true },
    });
    const hostelIds = userHostels.map(h => h.id);

    if (hostelIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get rooms in those hostels
    const userRooms = await db.room.findMany({
      where: { hostelId: { in: hostelIds } },
      select: { id: true },
    });
    const roomIds = userRooms.map(r => r.id);

    const bookings = await db.booking.findMany({
      where: {
        ...(roomIds.length > 0 ? { roomId: { in: roomIds } } : {}),
        ...(roomId ? { roomId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        room: {
          select: { id: true, name: true, hostel: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, guestName, guestPhone, startDate, endDate } = body;

    if (!roomId || !guestName || !guestPhone || !startDate || !endDate) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json({ error: 'La date de départ doit être après la date d\'arrivée' }, { status: 400 });
    }

    const room = await db.room.findUnique({
      where: { id: roomId },
      include: { hostel: { select: { phone: true } } },
    });

    if (!room || !room.isAvailable) {
      return NextResponse.json({ error: 'Chambre non disponible' }, { status: 400 });
    }

    const booking = await db.booking.create({
      data: {
        roomId,
        guestName,
        guestPhone,
        startDate: start,
        endDate: end,
        status: 'pending',
      },
      include: {
        room: {
          select: { id: true, name: true, pricePerNight: true, hostel: { select: { id: true, name: true, phone: true } } },
        },
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
