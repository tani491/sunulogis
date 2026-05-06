import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, isAdminRole } from '@/lib/auth';
import { PRO_PRICE } from '@/lib/constants';

// Modèle Freemium : les "revenus" sont la somme des abonnements Sunu Pro actifs.
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const [activeOwners, totalOwners, recentApproved] = await Promise.all([
      db.user.count({ where: { role: 'owner', isSubscribed: true } }),
      db.user.count({ where: { role: 'owner' } }),
      db.subscriptionRequest.findMany({
        where: { status: 'APPROVED' },
        orderBy: { updatedAt: 'desc' },
        take: 20,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      }),
    ]);

    const totalRevenue = activeOwners * PRO_PRICE;

    const recentPayments = recentApproved.map((r) => ({
      id: r.id,
      ownerName: r.user?.name ?? r.user?.email ?? '—',
      ownerEmail: r.user?.email ?? '',
      ownerPhone: r.user?.phone ?? null,
      amount: r.amount,
      status: r.status,
      transactionDetails: r.transactionDetails,
      paidAt: r.updatedAt,
    }));

    return NextResponse.json({
      stats: {
        activeOwners,
        totalOwners,
        totalRevenue,
        proPrice: PRO_PRICE,
      },
      recentPayments,
    });
  } catch (error) {
    console.error('[COMMISSIONS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
