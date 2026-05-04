import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, getCookieOptions, createSessionToken } from '@/lib/auth';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { loginSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  // A01/A07 — Brute-force protection: 10 attempts per IP per 15 minutes
  const ip = getClientIp(req);
  const rl = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.ok) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();

    // A03 — Input validation via Zod
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      // Generic message: don't reveal which field is wrong
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }
    const { email, password } = parsed.data;

    const profile = await db.profile.findUnique({ where: { email } });

    // A07 — Constant-time-equivalent check: always run verifyPassword even when user not found
    // to avoid timing-based user enumeration
    const dummyHash = '$2b$12$invalidhashfortimingequalisation.xxxxxxxxxxxxxxxxxxxxxx';
    const passwordValid = profile?.password
      ? await verifyPassword(password, profile.password)
      : await verifyPassword(password, dummyHash).then(() => false);

    if (!profile || !passwordValid) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    if (!profile.isActive) {
      return NextResponse.json({ error: 'Compte désactivé' }, { status: 403 });
    }

   // Plus besoin de migration, on utilise 'admin' directement
    if (profile.role === 'admin') {
      profile.role = 'admin';
    }

    const user = {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      role: profile.role,
      phone: profile.phone,
      isSubscribed: profile.isSubscribed,
    };

    const response = NextResponse.json(user);
    // A02/A05 — Issue HMAC-signed session token (not raw user ID)
    response.cookies.set('ac_session', createSessionToken(profile.id), getCookieOptions());
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 });
  }
}
