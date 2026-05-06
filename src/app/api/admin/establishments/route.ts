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
    const { establishmentId, isApproved, isSuspended } = body;

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
