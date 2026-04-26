import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, isAdminRole } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const users = await db.profile.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        _count: { select: { establishments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      users.map((profile) => ({
        ...profile,
        role: profile.role === 'super_admin' ? 'admin' : profile.role,
      }))
    );
  } catch (error) {
    console.error('Admin users error:', error);
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

    if (!userId || isActive === undefined) {
      return NextResponse.json({ error: 'userId et isActive requis' }, { status: 400 });
    }

    const updated = await db.profile.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, email: true, fullName: true, role: true, isActive: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
