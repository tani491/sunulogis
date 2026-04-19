import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hostelId = searchParams.get('hostelId');

    const rooms = await db.room.findMany({
      where: {
        ...(hostelId ? { hostelId } : {}),
      },
      include: { hostel: { select: { id: true, name: true, ownerId: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // If user is owner, only return rooms for their hostels
    const user = await getSessionUser();
    if (user) {
      const ownerRooms = rooms.filter(r => r.hostel.ownerId === user.id);
      if (hostelId) {
        return NextResponse.json({ rooms: ownerRooms });
      }
      // Public: show available rooms; owner: show all their rooms
      return NextResponse.json({ rooms: hostelId ? ownerRooms : rooms });
    }

    // Public: only available rooms
    const publicRooms = rooms.filter(r => r.isAvailable);
    return NextResponse.json({ rooms: publicRooms });
  } catch (error) {
    console.error('Get rooms error:', error);
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
    const { hostelId, name, pricePerNight, capacity } = body;

    if (!hostelId || !name || pricePerNight === undefined) {
      return NextResponse.json({ error: 'Champ requis manquant' }, { status: 400 });
    }

    // Verify hostel belongs to user
    const hostel = await db.hostel.findUnique({ where: { id: hostelId } });
    if (!hostel || hostel.ownerId !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const room = await db.room.create({
      data: {
        hostelId,
        name,
        pricePerNight: parseInt(pricePerNight),
        capacity: parseInt(capacity) || 1,
      },
    });

    return NextResponse.json({ room });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
