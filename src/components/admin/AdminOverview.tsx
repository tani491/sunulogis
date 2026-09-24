'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Banknote, Building2, CalendarDays, CheckCircle, Clock, Shield, UserRound } from 'lucide-react'

interface PlatformStats {
  totalEstablishments: number
  approvedEstablishments: number
  pendingEstablishments: number
  suspendedEstablishments: number
  activeProspects: number
  upcomingVisits: number
  estimatedCommissions: number
  collectedCommissions: number
}

export function AdminOverview() {
  const { navigate } = useAppStore()
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchStats() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin')
      if (res.ok) setStats(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchStats()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-28" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Shield className="h-6 w-6 text-primary" />
          Vue d’ensemble
        </h1>
        <p className="text-muted-foreground">Pilotage du catalogue et de l’activité commerciale SunuLogis.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Biens</p>
              <p className="text-2xl font-bold">{stats?.totalEstablishments || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <UserRound className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Prospects actifs</p>
              <p className="text-2xl font-bold">{stats?.activeProspects || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <CalendarDays className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Visites à venir</p>
              <p className="text-2xl font-bold">{stats?.upcomingVisits || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <Banknote className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Commissions estimées</p>
              <p className="text-2xl font-bold">{(stats?.estimatedCommissions || 0).toLocaleString()} FCFA</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="text-sm text-muted-foreground">Publiés</p>
              <p className="text-xl font-bold">{stats?.approvedEstablishments || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <Clock className="h-6 w-6 text-amber-600" />
            <div>
              <p className="text-sm text-muted-foreground">En attente</p>
              <p className="text-xl font-bold">{stats?.pendingEstablishments || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <Banknote className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="text-sm text-muted-foreground">Encaissé</p>
              <p className="text-xl font-bold">{(stats?.collectedCommissions || 0).toLocaleString()} FCFA</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {(stats?.pendingEstablishments || 0) > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Badge className="mb-2 bg-amber-600">Action requise</Badge>
              <p className="font-medium text-amber-900">{stats?.pendingEstablishments} bien{stats?.pendingEstablishments !== 1 ? 's' : ''} à valider.</p>
            </div>
            <Button variant="outline" onClick={() => navigate('admin-establishments')}>Examiner</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
