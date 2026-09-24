import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, isAdminRole } from '@/lib/auth'

async function requireAdmin() {
  const user = await getSessionUser()
  return user && isAdminRole(user.role) ? user : null
}

export async function GET() {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

    const prospects = await db.prospect.findMany({
      include: {
        properties: { select: { id: true, name: true, city: true, reference: true } },
        visits: { orderBy: { scheduledAt: 'asc' }, take: 2 },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    return NextResponse.json(prospects)
  } catch (error) {
    console.error('Admin prospects error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

    const body = await req.json()
    const { id, status, notes, followUpAt } = body
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

    const prospect = await db.prospect.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(followUpAt !== undefined ? { followUpAt: followUpAt ? new Date(followUpAt) : null } : {}),
      },
    })

    return NextResponse.json(prospect)
  } catch (error) {
    console.error('Update prospect error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

