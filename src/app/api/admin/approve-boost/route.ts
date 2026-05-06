import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, isAdminRole } from '@/lib/auth';
import { addDays } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { establishmentId } = await req.json();

    if (!establishmentId) {
      return NextResponse.json({ error: 'establishmentId requis' }, { status: 400 });
    }

    const establishment = await db.establishment.findUnique({
      where: { id: establishmentId },
      select: { id: true, ownerId: true, paymentPending: true },
    });

    if (!establishment) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    const boostExpiry = addDays(new Date(), 30);

    const updated = await db.establishment.update({
      where: { id: establishmentId },
      data: {
        isFeatured: true,
        isVerified: true,
        paymentPending: false,
        paymentStatus: 'paye',
        boostExpiry,
      },
    });

    await db.user.update({
      where: { id: establishment.ownerId },
      data: { isSubscribed: true },
    });

    return NextResponse.json({
      success: true,
      boostExpiry: updated.boostExpiry,
      message: `Boost activé jusqu'au ${boostExpiry.toLocaleDateString('fr-FR')}`,
    });
  } catch (error) {
    console.error('[APPROVE_BOOST_ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
