import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const SEARCH_ENGINES: Record<string, string> = {
  'google.': 'google',
  'bing.com': 'bing',
  'yahoo.com': 'yahoo',
  'duckduckgo.com': 'duckduckgo',
  'yandex.': 'yandex',
  'baidu.com': 'baidu',
  'ecosia.org': 'ecosia',
  'qwant.com': 'qwant',
}

const SOCIAL_NETWORKS: Record<string, string> = {
  'facebook.com': 'facebook',
  'fb.com': 'facebook',
  'fb.me': 'facebook',
  'instagram.com': 'instagram',
  'twitter.com': 'twitter',
  'x.com': 'twitter',
  't.co': 'twitter',
  'linkedin.com': 'linkedin',
  'lnkd.in': 'linkedin',
  'tiktok.com': 'tiktok',
  'youtube.com': 'youtube',
  'youtu.be': 'youtube',
  'pinterest.com': 'pinterest',
  'snapchat.com': 'snapchat',
  'reddit.com': 'reddit',
  'whatsapp.com': 'whatsapp',
  'wa.me': 'whatsapp',
  'telegram.org': 'telegram',
  't.me': 'telegram',
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
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return 'Local'
  }
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2000)
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country`, { signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) return null
    const data = await res.json() as { country?: string }
    return data.country ?? null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { path?: string; referrer?: string }
    const path = typeof body.path === 'string' ? body.path.slice(0, 500) : '/'
    const referrer = typeof body.referrer === 'string' && body.referrer ? body.referrer.slice(0, 1000) : null

    const { source, medium } = classifyReferrer(referrer)

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      req.headers.get('x-real-ip') ??
      '127.0.0.1'

    const country = await resolveCountry(ip)

    await db.pageView.create({
      data: { path, referrer, source, medium, country },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Analytics track error:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
