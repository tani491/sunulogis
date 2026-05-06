import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, getCookieOptions, createSessionToken } from '@/lib/auth';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { registerSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.ok) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Données invalides';
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const { email, password, fullName, phone, role } = parsed.data;

    const existing = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 });
    }

    const user = await db.user.create({
      data: {
        email,
        name: fullName,
        password: password ? await hashPassword(password) : null,
        phone: phone || null,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isSubscribed: true,
      },
    });

    const payload = {
      id: user.id,
      email: user.email,
      fullName: user.name,
      role: user.role,
      phone: user.phone,
      isSubscribed: user.isSubscribed,
    };

    const response = NextResponse.json(payload, { status: 201 });
    response.cookies.set('ac_session', createSessionToken(user.id), getCookieOptions());
    return response;
  } catch (error) {
    console.error('[REGISTER_ERROR]', error);
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
  }
}
