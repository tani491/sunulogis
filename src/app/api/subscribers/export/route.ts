import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, isAdminRole } from '@/lib/auth';

// GET - Export subscribers as CSV (admin only)
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const subscribers = await db.subscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Build CSV
    const header = 'Email,Consentement,Source,Date inscription\n';
    const rows = subscribers.map((s) => {
      const date = new Date(s.createdAt).toLocaleDateString('fr-FR');
      const consent = s.consentStatus ? 'Oui' : 'Non';
      return `"${s.email}","${consent}","${s.source}","${date}"`;
    }).join('\n');

    const csv = header + rows;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="subscribers_sunulogis.csv"',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
