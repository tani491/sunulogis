'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts'
import { TrendingUp, Globe, Share2, Search, MousePointerClick, BarChart2 } from 'lucide-react'

interface AnalyticsData {
  totalViews: number
  days: number
  bySource: { name: string; value: number }[]
  bySocial: { name: string; value: number }[]
  byCountry: { name: string; value: number }[]
  bySearchEngine: { name: string; value: number }[]
  byReferral: { name: string; value: number }[]
  dailyViews: { date: string; views: number }[]
  topPages: { path: string; views: number }[]
}

const SOURCE_COLORS: Record<string, string> = {
  direct: '#6366f1',
  search: '#22c55e',
  social: '#f59e0b',
  referral: '#3b82f6',
}

const SOURCE_LABELS: Record<string, string> = {
  direct: 'Direct',
  search: 'Moteurs de recherche',
  social: 'Réseaux sociaux',
  referral: 'Sites référents',
}

const SOCIAL_COLORS: Record<string, string> = {
  facebook: '#1877f2',
  instagram: '#e1306c',
  twitter: '#1da1f2',
  linkedin: '#0a66c2',
  tiktok: '#69c9d0',
  youtube: '#ff0000',
  whatsapp: '#25d366',
  telegram: '#0088cc',
  pinterest: '#e60023',
  reddit: '#ff4500',
}

const COUNTRY_FLAGS: Record<string, string> = {
  'Sénégal': '🇸🇳',
  'Senegal': '🇸🇳',
  'France': '🇫🇷',
  'Côte d\'Ivoire': '🇨🇮',
  'Mali': '🇲🇱',
  'Guinée': '🇬🇳',
  'Maroc': '🇲🇦',
  'Morocco': '🇲🇦',
  'Mauritanie': '🇲🇷',
  'Cameroun': '🇨🇲',
  'Belgium': '🇧🇪',
  'Belgique': '🇧🇪',
  'Canada': '🇨🇦',
  'United States': '🇺🇸',
  'États-Unis': '🇺🇸',
  'Germany': '🇩🇪',
  'Allemagne': '🇩🇪',
  'Spain': '🇪🇸',
  'Espagne': '🇪🇸',
  'Italy': '🇮🇹',
  'Italie': '🇮🇹',
  'United Kingdom': '🇬🇧',
  'Royaume-Uni': '🇬🇧',
  'Local': '🖥️',
  'Inconnu': '❓',
}

function getFlag(country: string) {
  return COUNTRY_FLAGS[country] ?? '🌍'
}

function formatDate(iso: string) {
  const [, month, day] = iso.split('-')
  return `${day}/${month}`
}

const PERIOD_OPTIONS = [7, 14, 30, 90] as const

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState<(typeof PERIOD_OPTIONS)[number]>(30)

  async function fetchAnalytics(d: number) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics?days=${d}`)
      if (res.ok) {
        const json = await res.json() as AnalyticsData
        setData(json)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchAnalytics(days)
  }, [days])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-primary" />
            Analytiques du trafic
          </h1>
          <p className="text-muted-foreground text-sm">Sources de visites, réseaux sociaux et pays</p>
        </div>
        <div className="flex items-center gap-2">
          {PERIOD_OPTIONS.map((d) => (
            <Button
              key={d}
              size="sm"
              variant={days === d ? 'default' : 'outline'}
              onClick={() => setDays(d)}
            >
              {d}j
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        </div>
      ) : data ? (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Visites totales</p>
                  <p className="text-2xl font-bold">{data.totalViews.toLocaleString('fr-FR')}</p>
                  <p className="text-xs text-muted-foreground">ces {days} derniers jours</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100">
                  <Share2 className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Réseaux sociaux</p>
                  <p className="text-2xl font-bold">
                    {data.bySource.find((s) => s.name === 'social')?.value ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.totalViews > 0
                      ? Math.round(((data.bySource.find((s) => s.name === 'social')?.value ?? 0) / data.totalViews) * 100)
                      : 0}% du trafic
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                  <Search className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recherche organique</p>
                  <p className="text-2xl font-bold">
                    {data.bySource.find((s) => s.name === 'search')?.value ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.totalViews > 0
                      ? Math.round(((data.bySource.find((s) => s.name === 'search')?.value ?? 0) / data.totalViews) * 100)
                      : 0}% du trafic
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pays détectés</p>
                  <p className="text-2xl font-bold">{data.byCountry.filter((c) => c.name !== 'Inconnu' && c.name !== 'Local').length}</p>
                  <p className="text-xs text-muted-foreground">pays différents</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily views line chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Évolution des visites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.dailyViews} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    labelFormatter={(l) => `Date : ${l}`}
                    formatter={(v) => [`${v} visite(s)`, 'Visites']}
                  />
                  <Line type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Traffic sources pie chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MousePointerClick className="h-4 w-4" />
                  Sources de trafic
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.bySource.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={data.bySource}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {data.bySource.map((entry) => (
                            <Cell key={entry.name} fill={SOURCE_COLORS[entry.name] ?? '#94a3b8'} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v, n) => [`${v} visite(s)`, SOURCE_LABELS[String(n)] ?? String(n)]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {data.bySource.map((s) => (
                        <div key={s.name} className="flex items-center gap-1.5 text-sm">
                          <span
                            className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                            style={{ background: SOURCE_COLORS[s.name] ?? '#94a3b8' }}
                          />
                          <span className="text-muted-foreground">{SOURCE_LABELS[s.name] ?? s.name}</span>
                          <Badge variant="secondary" className="text-xs px-1 py-0">{s.value}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social networks bar chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Réseaux sociaux
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.bySocial.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Aucune visite sociale détectée</p>
                ) : (
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={data.bySocial} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                      <Tooltip formatter={(v) => [`${v} visite(s)`, 'Visites']} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {data.bySocial.map((entry) => (
                          <Cell key={entry.name} fill={SOCIAL_COLORS[entry.name] ?? '#6366f1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Countries */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Pays d&apos;origine
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.byCountry.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée pays</p>
                ) : (
                  <div className="space-y-2">
                    {data.byCountry.map((c, i) => {
                      const pct = data.totalViews > 0 ? Math.round((c.value / data.totalViews) * 100) : 0
                      return (
                        <div key={c.name} className="flex items-center gap-3">
                          <span className="text-lg w-7 text-center">{getFlag(c.name)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-sm font-medium truncate">{c.name}</span>
                              <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{c.value} ({pct}%)</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          {i === 0 && <Badge variant="secondary" className="text-xs flex-shrink-0">#1</Badge>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Search engines + referrals */}
            <div className="space-y-4">
              {data.bySearchEngine.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Moteurs de recherche
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.bySearchEngine.map((s) => (
                        <div key={s.name} className="flex items-center justify-between text-sm">
                          <span className="capitalize font-medium">{s.name}</span>
                          <Badge variant="outline">{s.value} visite(s)</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {data.byReferral.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MousePointerClick className="h-4 w-4" />
                      Sites référents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.byReferral.map((r) => (
                        <div key={r.name} className="flex items-center justify-between text-sm">
                          <span className="truncate font-mono text-xs max-w-[180px]">{r.name}</span>
                          <Badge variant="outline">{r.value} visite(s)</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {data.bySearchEngine.length === 0 && data.byReferral.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-sm text-muted-foreground">
                    Aucun moteur de recherche ni site référent détecté pour cette période.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Top pages */}
          {data.topPages.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Pages les plus visitées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {data.topPages.map((p, i) => {
                    const pct = data.totalViews > 0 ? Math.round((p.views / data.totalViews) * 100) : 0
                    return (
                      <div key={p.path} className="flex items-center gap-3 py-2">
                        <span className="text-xs text-muted-foreground w-5 text-right flex-shrink-0">{i + 1}</span>
                        <span className="flex-1 text-sm font-mono truncate">{p.path}</span>
                        <span className="text-xs text-muted-foreground">{pct}%</span>
                        <Badge variant="secondary" className="text-xs">{p.views}</Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Impossible de charger les analytiques.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
