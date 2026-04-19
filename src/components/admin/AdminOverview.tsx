'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, BedDouble, CalendarDays, Clock, CheckCircle, AlertCircle, Shield } from 'lucide-react'

interface PlatformStats {
  totalOwners: number
  totalEstablishments: number
  approvedEstablishments: number
  pendingEstablishments: number
  suspendedEstablishments: number
  totalRooms: number
  totalBookings: number
}

export function AdminOverview() {
  const { navigate, currentUser } = useAppStore()
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin')
      const data = await res.json()
      if (res.ok) {
        setStats(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Administration SunuLogis
        </h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de la plateforme
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Propriétaires</p>
              <p className="text-2xl font-bold">{stats?.totalOwners || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Établissements</p>
              <p className="text-2xl font-bold">{stats?.totalEstablishments || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <BedDouble className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chambres</p>
              <p className="text-2xl font-bold">{stats?.totalRooms || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
              <CalendarDays className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Réservations</p>
              <p className="text-2xl font-bold">{stats?.totalBookings || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Establishment status breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-green-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approuvés</p>
              <p className="text-xl font-bold text-green-700">{stats?.approvedEstablishments || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">En attente</p>
              <p className="text-xl font-bold text-yellow-700">{stats?.pendingEstablishments || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Suspendus</p>
              <p className="text-xl font-bold text-red-700">{stats?.suspendedEstablishments || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick action for pending approvals */}
      {(stats?.pendingEstablishments || 0) > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  {stats?.pendingEstablishments} établissement{stats?.pendingEstablishments !== 1 ? 's' : ''} en attente d&apos;approbation
                </p>
                <p className="text-sm text-yellow-700">Action requise pour valider les nouveaux établissements</p>
              </div>
            </div>
            <Button onClick={() => navigate('admin-establishments')} variant="outline" className="gap-2">
              <Building2 className="h-4 w-4" />
              Gérer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick links */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Accès rapide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('admin-establishments')}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Gérer les établissements</p>
                <p className="text-sm text-muted-foreground">Approuver, suspendre, modifier</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('admin-users')}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Gérer les utilisateurs</p>
                <p className="text-sm text-muted-foreground">Activer, désactiver, voir les profils</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
