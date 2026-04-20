import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, isAdminRole } from '@/lib/auth';

function parseEstablishment(e: any) {
  return {
    ...e,
    images: typeof e.images === 'string' ? JSON.parse(e.images) : e.images,
    minPrice: e.rooms && e.rooms.length > 0
      ? Math.min(...e.rooms.filter((r: any) => r.isAvailable).map((r: any) => r.pricePerNight))
      : null,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const region = searchParams.get('region');
    const type = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');

    // Note: SQLite doesn't support mode: 'insensitive' but is case-insensitive by default for ASCII.
    // For PostgreSQL (Supabase), add mode: 'insensitive' to contains filters.
    const establishments = await db.establishment.findMany({
      where: {
        isApproved: true,
        isSuspended: false,
        ...(city ? { city: { contains: city } } : {}),
        ...(region ? { region } : {}),
        ...(type ? { type } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search } },
            { city: { contains: search } },
            { description: { contains: search } },
          ],
        } : {}),
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

    // Filter establishments that have rooms matching price criteria
    const filtered = establishments.filter(e => e.rooms.length > 0 || (!minPrice && !maxPrice));

    return NextResponse.json(filtered.map(parseEstablishment));
  } catch (error) {
    console.error('Get establishments error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (user.role !== 'owner' && !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Seuls les propriétaires peuvent créer des établissements' }, { status: 403 });
    }

    const body = await req.json();
    const { name, type, description, city, region, address, website, phone, images } = body;

    if (!name || !city) {
      return NextResponse.json({ error: 'Nom et ville requis' }, { status: 400 });
    }

    const establishment = await db.establishment.create({
      data: {
        ownerId: user.id,
        name,
        type: type || 'auberge',
        description: description || '',
        city,
        region: region || '',
        address: address || '',
        website: website || null,
        phone: phone || null,
        images: JSON.stringify(images || []),
        isApproved: false,
        isSuspended: false,
      },
      include: { rooms: true },
    });

    return NextResponse.json(parseEstablishment(establishment));
  } catch (error) {
    console.error('Create establishment error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
