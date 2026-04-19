import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, username, phone, role } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    const userRole = role === 'client' ? 'client' : 'owner';

    // Owners must have a password
    if (userRole === 'owner' && !password) {
      return NextResponse.json({ error: 'Le mot de passe est requis pour les propriétaires' }, { status: 400 });
    }

    const existing = await db.profile.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 });
    }

    // For clients without password, generate a random one
    const hashedPassword = hashPassword(password || randomUUID());

    const profile = await db.profile.create({
      data: {
        email,
        password: hashedPassword,
        fullName: fullName || null,
        username: username || null,
        phone: phone || null,
        role: userRole,
      },
      select: { id: true, email: true, fullName: true, role: true, phone: true },
    });

    const response = NextResponse.json(profile);
    response.cookies.set('ac_session', profile.id, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'inscription' }, { status: 500 });
  }
}
