import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, isAdminRole } from '@/lib/auth';

const VALID_DECISIONS = ['APPROVED', 'REJECTED'] as const;
type Decision = (typeof VALID_DECISIONS)[number];

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { requestId, decision } = body as {
      requestId?: string;
      decision?: Decision;
    };

    if (!requestId || typeof requestId !== 'string') {
      return NextResponse.json({ error: 'requestId requis' }, { status: 400 });
    }
    if (!decision || !VALID_DECISIONS.includes(decision)) {
      return NextResponse.json(
        { error: 'decision doit être APPROVED ou REJECTED' },
        { status: 400 },
      );
    }

    const request = await db.subscriptionRequest.findUnique({
      where: { id: requestId },
      select: { id: true, userId: true, status: true },
    });

    if (!request) {
      return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
    }
    if (request.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Demande déjà traitée (${request.status})` },
        { status: 409 },
      );
    }

    if (decision === 'APPROVED') {
      await db.$transaction([
        db.subscriptionRequest.update({
          where: { id: requestId },
          data: { status: 'APPROVED' },
        }),
        db.user.update({
          where: { id: request.userId },
          data: { isSubscribed: true },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: 'Abonnement Sunu Pro activé',
        decision: 'APPROVED',
      });
    }

    await db.subscriptionRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });

    return NextResponse.json({
      success: true,
      message: 'Demande rejetée',
      decision: 'REJECTED',
    });
  } catch (error) {
    console.error('[VALIDATE_SUBSCRIPTION_ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
