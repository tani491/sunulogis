import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, isAdminRole } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const [
      totalEstablishments,
      approvedEstablishments,
      pendingEstablishments,
      suspendedEstablishments,
      activeProspects,
      upcomingVisits,
      estimatedCommissions,
      collectedCommissions,
    ] = await Promise.all([
      db.establishment.count(),
      db.establishment.count({ where: { isApproved: true, isSuspended: false } }),
      db.establishment.count({ where: { isApproved: false } }),
      db.establishment.count({ where: { isSuspended: true } }),
      db.prospect.count({ where: { status: { notIn: ['CONCLU', 'PERDU'] } } }),
      db.visit.count({
        where: {
          status: 'PROGRAMMEE',
          scheduledAt: { gte: new Date() },
        },
      }),
      db.commission.aggregate({
        _sum: { amountEstimated: true },
        where: { status: { in: ['ESTIMEE', 'ACQUISE'] } },
      }),
      db.commission.aggregate({
        _sum: { amountCollected: true },
        where: { status: 'ENCAISSEE' },
      }),
    ]);

    return NextResponse.json({
      totalEstablishments,
      approvedEstablishments,
      pendingEstablishments,
      suspendedEstablishments,
      activeProspects,
      upcomingVisits,
      estimatedCommissions: estimatedCommissions._sum.amountEstimated ?? 0,
      collectedCommissions: collectedCommissions._sum.amountCollected ?? 0,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
