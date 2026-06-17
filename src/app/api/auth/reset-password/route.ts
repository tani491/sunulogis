import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { rateLimitAsync, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caracteres';
  if (password.length > 128) return 'Le mot de passe est trop long';
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
  }
  return null;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await rateLimitAsync(`reset-password:${ip}`, 8, 15 * 60 * 1000);
  if (!rl.ok) return rateLimitResponse(rl.resetAt, 8);

  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!token || !password) {
      return NextResponse.json({ error: 'Token et mot de passe requis' }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const resetToken = await db.passwordResetToken.findFirst({
      where: {
        tokenHash: hashToken(token),
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: { select: { id: true, isActive: true } },
      },
    });

    if (!resetToken || !resetToken.user.isActive) {
      return NextResponse.json({ error: 'Lien invalide ou expire' }, { status: 400 });
    }

    await db.$transaction([
      db.user.update({
        where: { id: resetToken.userId },
        data: { password: await hashPassword(password) },
      }),
      db.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[RESET_PASSWORD_ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
