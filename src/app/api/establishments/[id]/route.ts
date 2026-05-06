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

    // Non-public establishments are only visible to their owner or an admin
    if (!establishment.isApproved || establishment.isSuspended) {
      const user = await getSessionUser();
      const isOwner = user?.id === establishment.ownerId;
      if (!isOwner && !isAdminRole(user?.role)) {
        return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
      }
    }

    return NextResponse.json(parseEstablishment(establishment));
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

    const { id } = await params;
    const existing = await db.establishment.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    const body = await req.json();

    // Admin can edit/approve/suspend any establishment
    if (isAdminRole(user.role)) {
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
        },
        include: { rooms: true },
      });
      return NextResponse.json(parseEstablishment(establishment));
    }

    // Owner can update their own establishment
    if (existing.ownerId !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { name, type, description, city, region, address, website, phone, images, paymentPending } = body;

    const establishment = await db.establishment.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(description !== undefined && { description }),
        ...(city !== undefined && { city }),
        ...(region !== undefined && { region }),
        ...(address !== undefined && { address }),
        ...(website !== undefined && { website }),
        ...(phone !== undefined && { phone }),
        ...(images !== undefined && { images: JSON.stringify(images) }),
        ...(paymentPending === true && { paymentPending: true }),
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

    const { id } = await params;
    const existing = await db.establishment.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    if (existing.ownerId !== user.id && !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await db.establishment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete establishment error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
