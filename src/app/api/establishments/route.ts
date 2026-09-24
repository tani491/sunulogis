export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, isAdminRole } from '@/lib/auth';
import { establishmentSchema } from '@/lib/validation';
import { getPropertyOverrides, getPropertyReference, getPropertySlug } from '@/lib/real-estate';

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
  const overrides = getPropertyOverrides(e);
  const availablePrices = Array.isArray(e.rooms)
    ? e.rooms.filter((r: any) => r.isAvailable).map((r: any) => r.pricePerNight).filter((value: number) => Number.isFinite(value) && value > 0)
    : [];
  return {
    ...e,
    images: safeParseImages(e.images),
    minPrice: availablePrices.length > 0 ? Math.min(...availablePrices) : null,
    reference: e.reference || getPropertyReference(e),
    slug: e.slug || getPropertySlug(e),
    ...(overrides || {}),
    owner: e.owner ? { ...e.owner, fullName: e.owner.name ?? e.owner.fullName } : e.owner,
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
    const neighborhood = searchParams.get('neighborhood') || searchParams.get('address');
    const operationType = searchParams.get('operationType');
    const bedrooms = searchParams.get('bedrooms');
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const limitParam = parseInt(searchParams.get('limit') || '9', 10);
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 9;

    // Admin-only private listing. Public visitors only receive approved listings below.
    if (ownerId) {
      const user = await getSessionUser();
      if (!user || !isAdminRole(user.role)) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }

      const ownerEstablishments = await db.establishment.findMany({
        where: {
          ownerId,
          ...(city ? { city: { contains: city } } : {}),
          ...(region ? { region } : {}),
          ...(neighborhood ? { address: { contains: neighborhood } } : {}),
          ...(type ? { type } : {}),
          ...(search ? {
            OR: [
              { name: { contains: search } },
              { city: { contains: search } },
              { address: { contains: search } },
              { description: { contains: search } },
            ],
          } : {}),
        },
        include: {
          rooms: true,
          owner: { select: { id: true, name: true } },
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

    const roomPriceWhere = minPriceNum !== null || maxPriceNum !== null ? {
      pricePerNight: {
        ...(minPriceNum !== null ? { gte: minPriceNum } : {}),
        ...(maxPriceNum !== null ? { lte: maxPriceNum } : {}),
      },
    } : undefined;
    const propertyPriceWhere = minPriceNum !== null || maxPriceNum !== null ? {
      priceAmount: {
        ...(minPriceNum !== null ? { gte: minPriceNum } : {}),
        ...(maxPriceNum !== null ? { lte: maxPriceNum } : {}),
      },
    } : undefined;
    const bedroomNum = bedrooms ? parseInt(bedrooms, 10) : null;
    const andFilters: any[] = [];

    if (propertyPriceWhere) {
      andFilters.push({
        OR: [
          propertyPriceWhere,
          { rooms: { some: roomPriceWhere } },
        ],
      });
    }

    if (search) {
      andFilters.push({
        OR: [
          { name: { contains: search } },
          { city: { contains: search } },
          { address: { contains: search } },
          { description: { contains: search } },
        ],
      });
    }

    // Public listing: only approved and non-suspended establishments
    const where = {
      isApproved: true,
      isSuspended: false,
      ...(city ? { city: { contains: city } } : {}),
      ...(region ? { region } : {}),
      ...(neighborhood ? { address: { contains: neighborhood } } : {}),
      ...(type ? { type } : {}),
      ...(operationType && operationType !== 'all' ? { operationType: operationType as any } : {}),
      ...(bedroomNum !== null && Number.isFinite(bedroomNum) ? { bedrooms: { gte: bedroomNum } } : {}),
      ...(andFilters.length > 0 ? { AND: andFilters } : {}),
    };

    const [totalCount, establishments] = await db.$transaction([
      db.establishment.count({ where }),
      db.establishment.findMany({
        where,
        include: {
          rooms: {
            where: {
              ...(roomPriceWhere || {}),
            },
          },
          owner: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      establishments: establishments.map(parseEstablishment),
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      page,
      limit,
    });
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

    if (!isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Seul l’administrateur peut créer des établissements' }, { status: 403 });
    }

    const body = await req.json();

    // A03 — Validate and sanitize all fields via Zod schema
    const parsed = establishmentSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Données invalides';
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const {
      name,
      type,
      reference,
      slug,
      operationType,
      priceAmount,
      pricePeriod,
      priceStatus,
      bedrooms,
      surfaceM2,
      description,
      city,
      region,
      address,
      website,
      phone,
      images,
    } = parsed.data;

    const establishment = await db.establishment.create({
      data: {
        ownerId: user.id,
        name,
        type: type ?? 'auberge',
        reference: reference || null,
        slug: slug || null,
        operationType: operationType ?? 'SEJOUR_NUITEE',
        priceAmount: priceAmount ?? null,
        pricePeriod: pricePeriod ?? (operationType === 'VENTE' ? 'NONE' : operationType === 'LOCATION_MENSUELLE' ? 'MOIS' : 'NUITEE'),
        priceStatus: priceStatus ?? (priceAmount ? 'KNOWN' : 'SUR_DEMANDE'),
        bedrooms: bedrooms ?? null,
        surfaceM2: surfaceM2 ?? null,
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
