import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

function parseHostel(h: any) {
  return {
    ...h,
    images: typeof h.images === 'string' ? JSON.parse(h.images) : h.images,
    minPrice: h.rooms && h.rooms.length > 0
      ? Math.min(...h.rooms.filter((r: any) => r.isAvailable).map((r: any) => r.pricePerNight))
      : null,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const hostels = await db.hostel.findMany({
      where: {
        ...(city ? { city: { contains: city } } : {}),
      },
      include: {
        rooms: {
          where: {
            ...(minPrice || maxPrice ? {
              pricePerNight: {
                ...(minPrice ? { gte: parseInt(minPrice) } : {}),
                ...(maxPrice ? { lte: parseInt(maxPrice) } : {}),
              },
            } : {}),
          },
        },
        owner: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter hostels that have rooms matching price criteria
    const filtered = hostels.filter(h => h.rooms.length > 0 || (!minPrice && !maxPrice));

    return NextResponse.json(filtered.map(parseHostel));
  } catch (error) {
    console.error('Get hostels error:', error);
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
    const { name, description, city, address, website, phone, images } = body;

    if (!name || !city) {
      return NextResponse.json({ error: 'Nom et ville requis' }, { status: 400 });
    }

    const hostel = await db.hostel.create({
      data: {
        ownerId: user.id,
        name,
        description: description || '',
        city,
        address: address || '',
        website: website || null,
        phone: phone || null,
        images: JSON.stringify(images || []),
      },
      include: { rooms: true },
    });

    return NextResponse.json(parseHostel(hostel));
  } catch (error) {
    console.error('Create hostel error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
