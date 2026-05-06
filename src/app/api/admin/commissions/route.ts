import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, isAdminRole } from '@/lib/auth';
import { getCommissionAmount } from '@/lib/constants';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const establishments = await db.establishment.findMany({
      where: { isApproved: true },
      select: {
        id: true,
        name: true,
        type: true,
        city: true,
        region: true,
        commission: true,
        paymentStatus: true,
        owner: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { rooms: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const commissions = establishments.map((est) => {
      const expectedCommission = getCommissionAmount(est.type);
      return {
        id: est.id,
        name: est.name,
        type: est.type,
        city: est.city,
        region: est.region,
        owner: est.owner ? { ...est.owner, fullName: est.owner.name } : null,
        roomsCount: est._count.rooms,
        expectedCommission,
        currentCommission: est.commission,
        paymentStatus: est.paymentStatus,
        isPaid: est.paymentStatus === 'paye',
      };
    });

    const totalExpected = commissions.reduce((sum, e) => sum + e.expectedCommission, 0);
    const totalPaid = commissions.filter(e => e.isPaid).reduce((sum, e) => sum + e.expectedCommission, 0);

    return NextResponse.json({
      commissions,
      stats: {
        totalEstablishments: commissions.length,
        totalExpected,
        totalPaid,
        totalUnpaid: totalExpected - totalPaid,
        unpaidCount: commissions.filter(e => !e.isPaid).length,
      },
    });
  } catch (error) {
    console.error('[COMMISSIONS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await req.json();
    const { establishmentId, paymentStatus } = body;

    if (!establishmentId || typeof establishmentId !== 'string') {
      return NextResponse.json({ error: 'establishmentId requis' }, { status: 400 });
    }

    if (!['en_attente', 'paye'].includes(paymentStatus)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    const establishment = await db.establishment.findUnique({
      where: { id: establishmentId },
      select: { type: true },
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    const commissionAmount = getCommissionAmount(establishment.type);

    await db.establishment.update({
      where: { id: establishmentId },
      data: {
        paymentStatus,
        commission: paymentStatus === 'paye' ? commissionAmount : 0,
      },
    });

    return NextResponse.json({
      id: establishmentId,
      paymentStatus,
      commission: paymentStatus === 'paye' ? commissionAmount : 0,
    });
  } catch (error) {
    console.error('[COMMISSIONS_PUT_ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
