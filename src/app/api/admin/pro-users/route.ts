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
        isSubscribed: true,
        paymentReminder: true,
        createdAt: true,
        _count: { select: { establishments: true } },
      },
      orderBy: [{ role: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(users.map((u) => ({ ...u, fullName: u.name })));
  } catch (error) {
    console.error('[ADMIN_PRO_USERS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getSessionUser();
    if (!admin || !isAdminRole(admin.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { userId, action } = body as { userId?: string; action?: 'suspend' | 'unsuspend' | 'remind' };

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId et action requis' }, { status: 400 });
    }

    if (!['suspend', 'unsuspend', 'remind'].includes(action)) {
      return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
    }

    const updateData =
      action === 'suspend'
        ? { isSubscribed: false }
        : action === 'unsuspend'
          ? { isSubscribed: true, paymentReminder: false }
          : { paymentReminder: true };

    const updated = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isSubscribed: true,
        paymentReminder: true,
        createdAt: true,
        _count: { select: { establishments: true } },
      },
    });

    return NextResponse.json({ ...updated, fullName: updated.name });
  } catch (error) {
    console.error('[ADMIN_PRO_USERS_PUT_ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
