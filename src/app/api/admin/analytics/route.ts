import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, isAdminRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const days = Math.min(parseInt(searchParams.get('days') ?? '30', 10), 365)
    const since = new Date()
    since.setDate(since.getDate() - days)

    const views = await db.pageView.findMany({
      where: { createdAt: { gte: since } },
      select: { source: true, medium: true, country: true, createdAt: true, path: true },
      orderBy: { createdAt: 'asc' },
    })

    // Total views
    const totalViews = views.length

    // Views by source
    const sourceMap: Record<string, number> = {}
    for (const v of views) {
      sourceMap[v.source] = (sourceMap[v.source] ?? 0) + 1
    }
    const bySource = Object.entries(sourceMap).map(([name, value]) => ({ name, value }))

    // Views by social network (only source === 'social')
    const socialMap: Record<string, number> = {}
    for (const v of views) {
      if (v.source === 'social' && v.medium) {
        socialMap[v.medium] = (socialMap[v.medium] ?? 0) + 1
      }
    }
    const bySocial = Object.entries(socialMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    // Views by country
    const countryMap: Record<string, number> = {}
    for (const v of views) {
      const c = v.country ?? 'Inconnu'
      countryMap[c] = (countryMap[c] ?? 0) + 1
    }
    const byCountry = Object.entries(countryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15)

    // Views by search engine (source === 'search')
    const searchMap: Record<string, number> = {}
    for (const v of views) {
      if (v.source === 'search' && v.medium) {
        searchMap[v.medium] = (searchMap[v.medium] ?? 0) + 1
      }
    }
    const bySearchEngine = Object.entries(searchMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Views by referral domain (source === 'referral')
    const referralMap: Record<string, number> = {}
    for (const v of views) {
      if (v.source === 'referral' && v.medium) {
        referralMap[v.medium] = (referralMap[v.medium] ?? 0) + 1
      }
    }
    const byReferral = Object.entries(referralMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    // Daily views (group by date)
    const dailyMap: Record<string, number> = {}
    for (const v of views) {
      const date = v.createdAt.toISOString().slice(0, 10)
      dailyMap[date] = (dailyMap[date] ?? 0) + 1
    }
    // Fill in missing days with 0
    const dailyViews: { date: string; views: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const date = d.toISOString().slice(0, 10)
      dailyViews.push({ date, views: dailyMap[date] ?? 0 })
    }

    // Top pages
    const pagesMap: Record<string, number> = {}
    for (const v of views) {
      pagesMap[v.path] = (pagesMap[v.path] ?? 0) + 1
    }
    const topPages = Object.entries(pagesMap)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    return NextResponse.json({
      totalViews,
      days,
      bySource,
      bySocial,
      byCountry,
      bySearchEngine,
      byReferral,
      dailyViews,
      topPages,
    })
  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
