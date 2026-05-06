import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@sunulogis.sn';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin@SunuLogis2026!';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Route désactivée en production' }, { status: 403 });
  }

  try {
    const hashed = await hashPassword(ADMIN_PASSWORD);

    const admin = await db.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {
        name: 'Admin SunuLogis',
        role: 'admin',
        password: hashed,
        isActive: true,
      },
      create: {
        email: ADMIN_EMAIL,
        name: 'Admin SunuLogis',
        password: hashed,
        role: 'admin',
        isActive: true,
      },
      select: { id: true, email: true, role: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin créé / mis à jour avec succès',
      admin: admin.email,
    });
  } catch (error) {
    console.error('[SEED_ERROR]', error);
    return NextResponse.json({ error: 'Erreur de seeding' }, { status: 500 });
  }
}
