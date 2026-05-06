import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, isAdminRole } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        isSubscribed: true,
        createdAt: true,
        _count: { select: { establishments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      users.map((u) => ({ ...u, fullName: u.name }))
    );
  } catch (error) {
    console.error('[ADMIN_USERS_GET_ERROR]', error);
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
    const { userId, isActive } = body;

    if (!userId || typeof userId !== 'string' || isActive === undefined) {
      return NextResponse.json({ error: 'userId et isActive requis' }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: { isActive: Boolean(isActive) },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    return NextResponse.json({ ...updated, fullName: updated.name });
  } catch (error) {
    console.error('[ADMIN_USERS_PUT_ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
