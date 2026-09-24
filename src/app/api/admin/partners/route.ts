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

    const partners = await db.partner.findMany({
      include: {
        establishments: { select: { id: true, name: true, operationType: true } },
        commissions: { select: { id: true, status: true, amountEstimated: true, amountCollected: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(partners)
  } catch (error) {
    console.error('Admin partners error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

    const body = await req.json()
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
    }

    const partner = await db.partner.create({
      data: {
        name: body.name.trim(),
        phone: body.phone?.trim() || null,
        email: body.email?.trim() || null,
        company: body.company?.trim() || null,
        mandateDetails: body.mandateDetails?.trim() || '',
        notes: body.notes?.trim() || '',
      },
    })

    return NextResponse.json(partner, { status: 201 })
  } catch (error) {
    console.error('Create partner error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

