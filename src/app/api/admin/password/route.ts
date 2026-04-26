import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  getSessionUser,
  isAdminRole,
  hashPassword,
  verifyPassword,
  getExpiredCookieOptions,
} from '@/lib/auth';
import { changePasswordSchema } from '@/lib/validation';

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !isAdminRole(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const body = await req.json();

  // A03/A07 — Validate password complexity before touching the database
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Données invalides';
    return NextResponse.json({ error: message }, { status: 400 });
  }
  const { currentPassword, newPassword } = parsed.data;

  try {
    const profile = await db.profile.findUnique({ where: { id: user.id } });
    if (!profile?.password) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const currentValid = await verifyPassword(currentPassword, profile.password);
    if (!currentValid) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 401 });
    }

    await db.profile.update({
      where: { id: user.id },
      data: { password: await hashPassword(newPassword) },
    });

    // A05 — Invalidate the session after a password change; client must re-authenticate
    const response = NextResponse.json({ message: 'Mot de passe mis à jour. Veuillez vous reconnecter.' });
    response.cookies.set('ac_session', '', getExpiredCookieOptions());
    return response;
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
