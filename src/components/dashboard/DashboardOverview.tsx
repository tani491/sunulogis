'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BedDouble, CalendarDays, CheckCircle, Clock, Building2, Plus, AlertCircle, AlertTriangle } from 'lucide-react'
import { COMMISSION_RATES, getTypeLabel, WAVE_INFO } from '@/lib/constants'

interface Stats {
  totalRooms: number
  pendingBookings: number
  confirmedBookings: number
  totalEstablishments: number
  approvedEstablishments: number
  pendingEstablishments: number
}

interface UnpaidCommission {
  id: string
  name: string
  type: string
  commission: number
  paymentStatus: string
}

export function DashboardOverview() {
  const { navigate, currentUser } = useAppStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [unpaidCommissions, setUnpaidCommissions] = useState<UnpaidCommission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      fetchStats()
    }
  }, [currentUser])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const [establishmentsRes, bookingsRes] = await Promise.all([
        fetch('/api/establishments'),
        fetch('/api/bookings'),
      ])

      const establishments = await establishmentsRes.json()
      const bookings = await bookingsRes.json()

      const userEstablishments = establishments.filter((e: { ownerId: string }) => e.ownerId === currentUser?.id)
      const totalRooms = userEstablishments.reduce((acc: number, e: { rooms: unknown[] }) => acc + e.rooms.length, 0)
      const pendingBookings = bookings.filter((b: { status: string }) => b.status === 'pending').length
      const confirmedBookings = bookings.filter((b: { status: string }) => b.status === 'confirmed').length
      const approvedEstablishments = userEstablishments.filter((e: { isApproved: boolean }) => e.isApproved).length
      const pendingEstablishments = userEstablishments.filter((e: { isApproved: boolean }) => !e.isApproved).length

      // Find unpaid commissions for this owner's approved establishments
      const unpaid = userEstablishments
        .filter((e: { isApproved: boolean; paymentStatus: string }) => e.isApproved && e.paymentStatus !== 'paye')
        .map((e: { id: string; name: string; type: string; paymentStatus: string }) => ({
          id: e.id,
          name: e.name,
          type: e.type,
          commission: COMMISSION_RATES[e.type] || 1000,
          paymentStatus: e.paymentStatus || 'en_attente',
        }))

      setStats({
        totalRooms,
        pendingBookings,
        confirmedBookings,
        totalEstablishments: userEstablishments.length,
        approvedEstablishments,
        pendingEstablishments,
      })
      setUnpaidCommissions(unpaid)
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
        <h1 className="text-2xl font-bold">
          Bonjour, {currentUser?.fullName || 'Propriétaire'}
        </h1>
        <p className="text-muted-foreground">
          Voici un aperçu de votre activité
        </p>
      </div>

      {/* Commission Alert - Unpaid */}
      {unpaidCommissions.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div className="space-y-2">
                <p className="font-semibold text-red-800">
                  Commission en attente de paiement
                </p>
                <p className="text-sm text-red-700">
                  Merci de régler vos commissions via <strong>Wave au {WAVE_INFO.number} ({WAVE_INFO.name})</strong>
                </p>
              </div>
            </div>
            <div className="space-y-2 pl-8">
              {unpaidCommissions.map((est) => (
                <div key={est.id} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{est.name}</p>
                    <p className="text-xs text-muted-foreground">{getTypeLabel(est.type)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-700">{est.commission.toLocaleString()} FCFA</p>
                    <p className="text-[10px] text-red-500">En attente</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between bg-white/80 rounded-lg px-3 py-2 border border-red-200">
                <p className="text-sm font-semibold text-red-800">Total à payer</p>
                <p className="text-base font-bold text-red-800">
                  {unpaidCommissions.reduce((sum, e) => sum + e.commission, 0).toLocaleString()} FCFA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">En attente</p>
              <p className="text-2xl font-bold">{stats?.pendingBookings || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Confirmées</p>
              <p className="text-2xl font-bold">{stats?.confirmedBookings || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval status */}
      {(stats?.pendingEstablishments || 0) > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">
                {stats?.pendingEstablishments} établissement{stats?.pendingEstablishments !== 1 ? 's' : ''} en attente d&apos;approbation
              </p>
              <p className="text-sm text-yellow-700">Vos établissements seront visibles après validation par l&apos;administration</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('dashboard-rooms')}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Ajouter une chambre</p>
                <p className="text-sm text-muted-foreground">Gérez vos chambres</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('dashboard-bookings')}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Voir réservations</p>
                <p className="text-sm text-muted-foreground">Gérez vos réservations</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
