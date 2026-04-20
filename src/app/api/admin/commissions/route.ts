import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// Commission rates by establishment type
const COMMISSION_RATES: Record<string, number> = {
  auberge: 1000,
  hotel: 3000,
  appartement: 2500,
  appartement_meuble: 2500,
  lodge: 2500,
  loft: 2500,
};

// GET - All commissions data (admin only)
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const establishments = await db.establishment.findMany({
      where: { isApproved: true },
      include: {
        owner: { select: { id: true, fullName: true, email: true, phone: true } },
        rooms: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate commission for each establishment
    const commissionsData = establishments.map((est) => {
      const expectedCommission = COMMISSION_RATES[est.type] || 1000;
      return {
        id: est.id,
        name: est.name,
        type: est.type,
        city: est.city,
        region: est.region,
        owner: est.owner,
        roomsCount: est.rooms.length,
        expectedCommission,
        currentCommission: est.commission,
        paymentStatus: est.paymentStatus,
        isPaid: est.paymentStatus === 'paye',
      };
    });

    // Stats
    const totalExpected = commissionsData.reduce((sum, e) => sum + e.expectedCommission, 0);
    const totalPaid = commissionsData.filter((e) => e.isPaid).reduce((sum, e) => sum + e.expectedCommission, 0);
    const totalUnpaid = totalExpected - totalPaid;
    const unpaidCount = commissionsData.filter((e) => !e.isPaid).length;

    return NextResponse.json({
      commissions: commissionsData,
      stats: {
        totalEstablishments: commissionsData.length,
        totalExpected,
        totalPaid,
        totalUnpaid,
        unpaidCount,
      },
    });
  } catch (error) {
    console.error('Commissions error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Update payment status (admin only)
export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { establishmentId, paymentStatus } = body;

    if (!establishmentId || !paymentStatus) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    if (!['en_attente', 'paye'].includes(paymentStatus)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    // Get establishment type to determine commission amount
    const establishment = await db.establishment.findUnique({
      where: { id: establishmentId },
      select: { type: true },
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    const commissionAmount = COMMISSION_RATES[establishment.type] || 1000;

    const updated = await db.establishment.update({
      where: { id: establishmentId },
      data: {
        paymentStatus,
        commission: paymentStatus === 'paye' ? commissionAmount : 0,
      },
    });

    return NextResponse.json({ message: 'Statut mis à jour', establishment: updated });
  } catch (error) {
    console.error('Update commission error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
