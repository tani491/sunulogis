import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, isAdminRole } from '@/lib/auth';
import { getPropertyOverrides, getPropertyReference, getPropertySlug } from '@/lib/real-estate';

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

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const establishments = await db.establishment.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true } },
        rooms: { select: { id: true, isAvailable: true, pricePerNight: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(establishments.map(parseEstablishment));
  } catch (error) {
    console.error('Admin establishments error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await req.json();
    const { establishmentId, isApproved, isSuspended, isFeatured } = body;

    if (!establishmentId) {
      return NextResponse.json({ error: 'establishmentId requis' }, { status: 400 });
    }

    const existing = await db.establishment.findUnique({ where: { id: establishmentId } });
    if (!existing) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    const updated = await db.establishment.update({
      where: { id: establishmentId },
      data: {
        ...(isApproved !== undefined && { isApproved }),
        ...(isSuspended !== undefined && { isSuspended }),
        ...(isFeatured !== undefined && { isFeatured }),
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        rooms: { select: { id: true } },
      },
    });

    return NextResponse.json(parseEstablishment(updated));
  } catch (error) {
    console.error('Admin update establishment error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
