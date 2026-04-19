import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

function parseHostel(h: any) {
  return {
    ...h,
    images: typeof h.images === 'string' ? JSON.parse(h.images) : h.images,
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const hostel = await db.hostel.findUnique({
      where: { id },
      include: {
        rooms: { orderBy: { createdAt: 'desc' } },
        owner: { select: { id: true, fullName: true, phone: true } },
      },
    });

    if (!hostel) {
      return NextResponse.json({ error: 'Auberge non trouvée' }, { status: 404 });
    }

    return NextResponse.json(parseHostel(hostel));
  } catch (error) {
    console.error('Get hostel error:', error);
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
    const existing = await db.hostel.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Auberge non trouvée' }, { status: 404 });
    }

    if (existing.ownerId !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, city, address, website, phone, images } = body;

    const hostel = await db.hostel.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(city !== undefined && { city }),
        ...(address !== undefined && { address }),
        ...(website !== undefined && { website }),
        ...(phone !== undefined && { phone }),
        ...(images !== undefined && { images: JSON.stringify(images) }),
      },
      include: { rooms: true },
    });

    return NextResponse.json(parseHostel(hostel));
  } catch (error) {
    console.error('Update hostel error:', error);
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
    const existing = await db.hostel.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Auberge non trouvée' }, { status: 404 });
    }

    if (existing.ownerId !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await db.hostel.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete hostel error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
