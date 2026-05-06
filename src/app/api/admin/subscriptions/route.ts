import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, isAdminRole } from '@/lib/auth';
import { isAfter } from 'date-fns';

const PRO_PRICE = 15000;

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const establishments = await db.establishment.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        city: true,
        region: true,
        isFeatured: true,
        isVerified: true,
        isApproved: true,
        isSuspended: true,
        paymentPending: true,
        paymentStatus: true,
        boostExpiry: true,
        viewsCount: true,
        clicksCount: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { paymentPending: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    const now = new Date();

    const subscriptions = establishments.map(e => ({
      ...e,
      fullName: e.owner?.name,
      owner: e.owner ? { ...e.owner, fullName: e.owner.name } : null,
      subscriptionActive: e.isFeatured && e.boostExpiry ? isAfter(e.boostExpiry, now) : false,
      subscriptionPrice: PRO_PRICE,
    }));

    const stats = {
      totalPendingRequests: subscriptions.filter(e => e.paymentPending).length,
      totalActive: subscriptions.filter(e => e.subscriptionActive).length,
      totalExpired: subscriptions.filter(e => e.isFeatured && !e.subscriptionActive).length,
      totalRevenue: subscriptions
        .filter(e => e.paymentStatus === 'paye')
        .length * PRO_PRICE,
    };

    return NextResponse.json({ subscriptions, stats });
  } catch (error) {
    console.error('[SUBSCRIPTIONS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
