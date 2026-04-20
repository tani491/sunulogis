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
      totalOwners,
      totalEstablishments,
      approvedEstablishments,
      pendingEstablishments,
      suspendedEstablishments,
      totalRooms,
      totalBookings,
    ] = await Promise.all([
      db.profile.count({ where: { role: 'owner' } }),
      db.establishment.count(),
      db.establishment.count({ where: { isApproved: true, isSuspended: false } }),
      db.establishment.count({ where: { isApproved: false } }),
      db.establishment.count({ where: { isSuspended: true } }),
      db.room.count(),
      db.booking.count(),
    ]);

    return NextResponse.json({
      totalOwners,
      totalEstablishments,
      approvedEstablishments,
      pendingEstablishments,
      suspendedEstablishments,
      totalRooms,
      totalBookings,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
