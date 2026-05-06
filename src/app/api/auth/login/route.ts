import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, getCookieOptions, createSessionToken } from '@/lib/auth';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { loginSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.ok) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }
    const { email, password } = parsed.data;

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        password: true,
        isActive: true,
        isSubscribed: true,
      },
    });

    // Hash bcrypt valide (de "x") utilisé pour égaliser le timing quand l'utilisateur n'existe pas
    const dummyHash = '$2b$12$abcdefghijklmnopqrstuOmJ4hYU9HgMBDR8JfOZ1V.G3sBKNUS9q';
    const passwordValid = user?.password
      ? await verifyPassword(password, user.password)
      : await verifyPassword(password, dummyHash).then(() => false).catch(() => false);

    if (!user || !passwordValid) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Compte désactivé' }, { status: 403 });
    }

    const payload = {
      id: user.id,
      email: user.email,
      fullName: user.name,
      role: user.role,
      phone: user.phone,
      isSubscribed: user.isSubscribed,
    };

    const response = NextResponse.json(payload);
    response.cookies.set('ac_session', createSessionToken(user.id), getCookieOptions());
    return response;
  } catch (error) {
    console.error('[LOGIN_ERROR]', error);
    return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 });
  }
}
