import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, getCookieOptions, createSessionToken } from '@/lib/auth';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { registerSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  // A07 — Brute-force / account-farming protection: 5 registrations per IP per 15 minutes
  const ip = getClientIp(req);
  const rl = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.ok) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();

    // A03 — Validate and whitelist all input fields via Zod
    // Roles are restricted to 'client' | 'owner'; 'admin' cannot be self-assigned
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Données invalides';
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const { email, password, fullName, username, phone, role, isSubscribed } = parsed.data;

    const existing = await db.profile.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 });
    }

  const profile = await db.profile.create({
      data: {
        email,
        password: password ? await hashPassword(password) : null,
        fullName,
        username: username || null, // Utilise || null pour éviter le undefined
        phone: phone || null,      // Idem ici
        role,
        // La nouvelle ligne :
        isSubscribed: !!isSubscribed,
      },
    });
   // --- À METTRE JUSTE ICI (Ligne 39) ---
    
    // On crée un objet "user" propre (on n'envoie pas le mot de passe au navigateur)
    const user = {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      role: profile.role,
      username: profile.username,
    };

    const response = NextResponse.json(user);
    
    // On donne le badge de connexion (le cookie)
    response.cookies.set('ac_session', createSessionToken(profile.id), getCookieOptions());
    
    return response;

    // --- FIN DU BLOC ---
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
  }
}
