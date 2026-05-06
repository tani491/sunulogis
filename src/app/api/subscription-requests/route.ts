import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { PRO_PRICE } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const transactionDetails =
      typeof body.transactionDetails === 'string' ? body.transactionDetails.trim() : '';

    if (!transactionDetails || transactionDetails.length < 4) {
      return NextResponse.json(
        { error: 'Détails de transaction requis (numéro ou ID)' },
        { status: 400 },
      );
    }
    if (transactionDetails.length > 200) {
      return NextResponse.json({ error: 'Détails trop longs' }, { status: 400 });
    }

    const existingPending = await db.subscriptionRequest.findFirst({
      where: { userId: user.id, status: 'PENDING' },
      select: { id: true },
    });
    if (existingPending) {
      return NextResponse.json(
        { error: 'Une demande est déjà en attente de validation' },
        { status: 409 },
      );
    }

    const request = await db.subscriptionRequest.create({
      data: {
        userId: user.id,
        amount: PRO_PRICE,
        status: 'PENDING',
        transactionDetails,
      },
      select: { id: true, status: true, amount: true, createdAt: true },
    });

    return NextResponse.json({ success: true, request }, { status: 201 });
  } catch (error) {
    console.error('[SUBSCRIPTION_REQUEST_CREATE_ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const requests = await db.subscriptionRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('[SUBSCRIPTION_REQUEST_LIST_ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
