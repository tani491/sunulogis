import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, isAdminRole } from '@/lib/auth';
import { establishmentSchema } from '@/lib/validation';

// A03 — Never call JSON.parse without a try-catch; malformed data must not crash the route
function safeParseImages(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== 'string') return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseEstablishment(e: any) {
  return {
    ...e,
    images: safeParseImages(e.images),
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
    const ownerId = searchParams.get('ownerId');

    // If ownerId is provided, return establishments for that owner (including unapproved)
    // This is used by the owner dashboard. For security, only the owner themselves or admins can request this.
    if (ownerId) {
      const user = await getSessionUser();
      if (!user || (user.id !== ownerId && !isAdminRole(user.role))) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }

      const ownerEstablishments = await db.establishment.findMany({
        where: {
          ownerId,
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
          rooms: true,
          owner: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(ownerEstablishments.map(parseEstablishment));
    }

    // A03 — Validate numeric query params before passing to ORM
    const minPriceNum = minPrice ? parseInt(minPrice, 10) : null;
    const maxPriceNum = maxPrice ? parseInt(maxPrice, 10) : null;
    if ((minPrice && isNaN(minPriceNum!)) || (maxPrice && isNaN(maxPriceNum!))) {
      return NextResponse.json({ error: 'Paramètre de prix invalide' }, { status: 400 });
    }

    // Public listing: only approved and non-suspended establishments
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
            ...(minPriceNum !== null || maxPriceNum !== null ? {
              pricePerNight: {
                ...(minPriceNum !== null ? { gte: minPriceNum } : {}),
                ...(maxPriceNum !== null ? { lte: maxPriceNum } : {}),
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

    // A03 — Validate and sanitize all fields via Zod schema
    const parsed = establishmentSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Données invalides';
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const { name, type, description, city, region, address, website, phone, images } = parsed.data;

    const establishment = await db.establishment.create({
      data: {
        ownerId: user.id,
        name,
        type: type ?? 'auberge',
        description: description ?? '',
        city,
        region: region ?? '',
        address: address ?? '',
        website: website ?? null,
        phone: phone ?? null,
        images: JSON.stringify(images ?? []),
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
