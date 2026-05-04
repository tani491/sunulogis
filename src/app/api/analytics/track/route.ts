import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const SEARCH_ENGINES: Record<string, string> = {
  'google.': 'google', 'bing.com': 'bing', 'yahoo.com': 'yahoo',
  'duckduckgo.com': 'duckduckgo', 'yandex.': 'yandex', 'baidu.com': 'baidu',
  'ecosia.org': 'ecosia', 'qwant.com': 'qwant',
}

const SOCIAL_NETWORKS: Record<string, string> = {
  'facebook.com': 'facebook', 'fb.com': 'facebook', 'fb.me': 'facebook',
  'instagram.com': 'instagram', 'twitter.com': 'twitter', 'x.com': 'twitter',
  't.co': 'twitter', 'linkedin.com': 'linkedin', 'tiktok.com': 'tiktok',
  'youtube.com': 'youtube', 'pinterest.com': 'pinterest', 'whatsapp.com': 'whatsapp',
  'wa.me': 'whatsapp', 't.me': 'telegram',
}

function classifyReferrer(referrer: string | null): { source: string; medium: string | null } {
  if (!referrer) return { source: 'direct', medium: null }
  let host: string
  try {
    host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return { source: 'direct', medium: null }
  }
  for (const [pattern, name] of Object.entries(SOCIAL_NETWORKS)) {
    if (host.includes(pattern)) return { source: 'social', medium: name }
  }
  for (const [pattern, name] of Object.entries(SEARCH_ENGINES)) {
    if (host.includes(pattern)) return { source: 'search', medium: name }
  }
  return { source: 'referral', medium: host }
}

async function resolveCountry(ip: string): Promise<string | null> {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.')) return 'Local'
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country`, { signal: AbortSignal.timeout(2000) })
    if (!res.ok) return null
    const data = await res.json() as { country?: string }
    return data.country ?? null
  } catch { return null }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { path, referrer, establishmentId, type } = body

    // 1. ANALYTIQUE GÉNÉRALE (Ton code existant)
    const { source, medium } = classifyReferrer(referrer)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
    const country = await resolveCountry(ip)

    await db.pageView.create({
      data: { 
        path: typeof path === 'string' ? path.slice(0, 500) : '/',
        referrer: typeof referrer === 'string' ? referrer.slice(0, 1000) : null,
        source, medium, country 
      },
    })

    // 2. TRACKING PRO (Logique Freemium pour les propriétaires)
    if (establishmentId) {
      // On vérifie d'abord si l'établissement existe pour éviter une erreur 500
      const exists = await db.establishment.findUnique({ 
        where: { id: establishmentId },
        select: { id: true } 
      })

      if (exists) {
        if (type === 'view') {
          await db.establishment.update({
            where: { id: establishmentId },
            data: { viewsCount: { increment: 1 } }
          })
        } else if (type === 'click') {
          await db.establishment.update({
            where: { id: establishmentId },
            data: { clicksCount: { increment: 1 } }
          })
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Analytics track error:', error)
    // On renvoie "ok: true" même en cas d'erreur pour que le visiteur ne voie rien
    return NextResponse.json({ ok: true }) 
  }
}