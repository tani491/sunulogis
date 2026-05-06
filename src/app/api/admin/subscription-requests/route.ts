import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, isAdminRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const status = req.nextUrl.searchParams.get('status') ?? undefined;
    const where = status ? { status } : {};

    const requests = await db.subscriptionRequest.findMany({
      where,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isSubscribed: true,
            role: true,
          },
        },
      },
    });

    const stats = {
      pending: requests.filter((r) => r.status === 'PENDING').length,
      approved: requests.filter((r) => r.status === 'APPROVED').length,
      rejected: requests.filter((r) => r.status === 'REJECTED').length,
    };

    return NextResponse.json({ requests, stats });
  } catch (error) {
    console.error('[ADMIN_SUBSCRIPTION_REQUESTS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
