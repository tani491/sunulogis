import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@sunulogis.sn';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin@SunuLogis2026!';

// NOTE: cette route doit être supprimée manuellement après usage.
export async function GET() {
  try {
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const admin = await db.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {
        name: 'Admin SunuLogis',
        password: hashed,
        role: 'admin',
        isActive: true,
      },
      create: {
        email: ADMIN_EMAIL,
        name: 'Admin SunuLogis',
        password: hashed,
        role: 'admin',
        isActive: true,
      },
      select: { id: true, email: true, role: true, isActive: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin créé / mis à jour avec succès',
      admin,
      usingEnvEmail: Boolean(process.env.ADMIN_EMAIL),
      usingEnvPassword: Boolean(process.env.ADMIN_PASSWORD),
    });
  } catch (error) {
    console.error('[SEED_ERROR]', error);
    return NextResponse.json(
      { error: 'Erreur de seeding', detail: String((error as Error)?.message ?? error) },
      { status: 500 },
    );
  }
}
