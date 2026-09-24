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

    const [commissions, estimated, acquired, collected] = await Promise.all([
      db.commission.findMany({
        include: {
          partner: { select: { id: true, name: true, company: true } },
          establishment: { select: { id: true, name: true, reference: true } },
          prospect: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
      db.commission.aggregate({ _sum: { amountEstimated: true }, where: { status: 'ESTIMEE' } }),
      db.commission.aggregate({ _sum: { amountEstimated: true }, where: { status: 'ACQUISE' } }),
      db.commission.aggregate({ _sum: { amountCollected: true }, where: { status: 'ENCAISSEE' } }),
    ])

    return NextResponse.json({
      stats: {
        estimated: estimated._sum.amountEstimated ?? 0,
        acquired: acquired._sum.amountEstimated ?? 0,
        collected: collected._sum.amountCollected ?? 0,
      },
      commissions,
    })
  } catch (error) {
    console.error('Admin commissions error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

    const body = await req.json()
    const commission = await db.commission.create({
      data: {
        partnerId: body.partnerId || null,
        establishmentId: body.establishmentId || null,
        prospectId: body.prospectId || null,
        type: body.type || 'POURCENTAGE',
        rate: body.rate ? Number(body.rate) : null,
        amountFixed: body.amountFixed ? Number(body.amountFixed) : null,
        amountEstimated: body.amountEstimated ? Number(body.amountEstimated) : null,
        amountInvoiced: body.amountInvoiced ? Number(body.amountInvoiced) : null,
        amountCollected: body.amountCollected ? Number(body.amountCollected) : null,
        status: body.status || 'ESTIMEE',
        notes: body.notes?.trim() || '',
        dueAt: body.dueAt ? new Date(body.dueAt) : null,
        paidAt: body.paidAt ? new Date(body.paidAt) : null,
      },
    })

    return NextResponse.json(commission, { status: 201 })
  } catch (error) {
    console.error('Create commission error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

    const commission = await db.commission.update({
      where: { id: body.id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.amountCollected !== undefined ? { amountCollected: Number(body.amountCollected) || null } : {}),
        ...(body.amountInvoiced !== undefined ? { amountInvoiced: Number(body.amountInvoiced) || null } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        ...(body.paidAt !== undefined ? { paidAt: body.paidAt ? new Date(body.paidAt) : null } : {}),
      },
    })

    return NextResponse.json(commission)
  } catch (error) {
    console.error('Update commission error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

