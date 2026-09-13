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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const establishment = await db.establishment.findUnique({
      where: { id },
      include: {
        rooms: { orderBy: { createdAt: 'desc' } },
        owner: { select: { id: true, name: true, phone: true } },
      },
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    const user = await getSessionUser();
    const isAdmin = isAdminRole(user?.role);

    // Non-public establishments are only visible to an admin
    if (!establishment.isApproved || establishment.isSuspended) {
      if (!isAdmin) {
        return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
      }
    }

    const payload = parseEstablishment(establishment);
    if (!isAdmin) {
      payload.owner = null;
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Get establishment error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (!isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Seul l’administrateur peut modifier des établissements' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await db.establishment.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    const body = await req.json();

    const establishment = await db.establishment.update({
      where: { id },
      data: {
        ...(body.isApproved !== undefined && { isApproved: body.isApproved }),
        ...(body.isSuspended !== undefined && { isSuspended: body.isSuspended }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.region !== undefined && { region: body.region }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.website !== undefined && { website: body.website }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.images !== undefined && { images: JSON.stringify(body.images) }),
        ...(body.isFeatured !== undefined && existing.isApproved && { isFeatured: body.isFeatured }),
      },
      include: { rooms: true },
    });

    return NextResponse.json(parseEstablishment(establishment));
  } catch (error) {
    console.error('Update establishment error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (!isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Seul l’administrateur peut supprimer des établissements' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await db.establishment.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    await db.establishment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete establishment error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
