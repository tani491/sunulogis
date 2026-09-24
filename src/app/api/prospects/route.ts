import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { rateLimitAsync } from '@/lib/rate-limit'

const prospectRequestSchema = z.object({
  name: z.string().min(2, 'Nom requis').max(200),
  phone: z.string().min(5, 'Téléphone requis').max(30),
  email: z.string().email('E-mail invalide').max(254).optional().or(z.literal('')),
  projectType: z.enum(['VENTE', 'LOCATION_MENSUELLE', 'SEJOUR_NUITEE']).optional(),
  desiredZone: z.string().max(200).optional().or(z.literal('')),
  budget: z.number().int().positive().nullable().optional(),
  timeframe: z.string().max(120).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
})

function getIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimitAsync(`prospect:${getIp(req)}`, 8, 60 * 60 * 1000)
    if (!rl.ok) {
      return NextResponse.json({ error: 'Trop de demandes. Réessayez plus tard.' }, { status: 429 })
    }

    const body = await req.json()
    const parsed = prospectRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Données invalides' }, { status: 400 })
    }

    const data = parsed.data
    await db.prospect.create({
      data: {
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || null,
        projectType: data.projectType,
        desiredZone: data.desiredZone?.trim() || '',
        budget: data.budget ?? null,
        timeframe: data.timeframe?.trim() || '',
        notes: data.notes?.trim() || '',
        source: 'site-demande-sur-mesure',
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Create prospect error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
