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

    const visits = await db.visit.findMany({
      include: {
        prospect: { select: { id: true, name: true, phone: true, status: true } },
        establishment: { select: { id: true, name: true, city: true, reference: true } },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 200,
    })

    return NextResponse.json(visits)
  } catch (error) {
    console.error('Admin visits error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

    const body = await req.json()
    if (!body.scheduledAt) {
      return NextResponse.json({ error: 'Date de visite requise' }, { status: 400 })
    }

    const visit = await db.visit.create({
      data: {
        prospectId: body.prospectId || null,
        establishmentId: body.establishmentId || null,
        scheduledAt: new Date(body.scheduledAt),
        status: body.status || 'PROGRAMMEE',
        notes: body.notes?.trim() || '',
      },
    })

    if (body.prospectId) {
      await db.prospect.update({
        where: { id: body.prospectId },
        data: { status: 'VISITE_PROGRAMMEE' },
      })
    }

    return NextResponse.json(visit, { status: 201 })
  } catch (error) {
    console.error('Create visit error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

    const visit = await db.visit.update({
      where: { id: body.id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        ...(body.scheduledAt ? { scheduledAt: new Date(body.scheduledAt) } : {}),
      },
    })

    return NextResponse.json(visit)
  } catch (error) {
    console.error('Update visit error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

