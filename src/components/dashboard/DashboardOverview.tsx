'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  BedDouble, CalendarDays, CheckCircle, Clock, Building2, Plus,
  AlertCircle, AlertTriangle, Lock, Eye, MessageCircle, Zap,
  Shield, Star, TrendingUp, Sparkles,
} from 'lucide-react'
import { COMMISSION_RATES, getTypeLabel, WAVE_INFO, PRO_FEATURES } from '@/lib/constants'
import { format, isAfter } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { PlanSelector } from '@/components/PlanSelector'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface EstablishmentStats {
  id: string
  name: string
  type: string
  city: string
  isApproved: boolean
  isSuspended: boolean
  isFeatured: boolean
  isVerified: boolean
  paymentPending: boolean
  boostExpiry: string | null
  paymentStatus: string
  commission: number
  viewsCount: number
  clicksCount: number
}

interface Stats {
  totalRooms: number
  pendingBookings: number
  confirmedBookings: number
  totalEstablishments: number
  approvedEstablishments: number
  pendingEstablishments: number
}

export function DashboardOverview() {
  const { navigate, currentUser } = useAppStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [establishments, setEstablishments] = useState<EstablishmentStats[]>([])
  const [loading, setLoading] = useState(true)
  const [declaringId, setDeclaringId] = useState<string | null>(null)
  const [showPlanModal, setShowPlanModal] = useState(false)

  const isPro = currentUser?.isSubscribed === true

  async function fetchStats() {
    setLoading(true)
    try {
      const [establishmentsRes, bookingsRes] = await Promise.all([
        fetch(`/api/establishments?ownerId=${currentUser?.id}`),
        fetch('/api/bookings'),
      ])

      const rawEstablishments = await establishmentsRes.json()
      const rawBookings = await bookingsRes.json()
      const bookings: { status: string }[] = Array.isArray(rawBookings) ? rawBookings : []

      const userEstablishments: EstablishmentStats[] = (Array.isArray(rawEstablishments) ? rawEstablishments : [])
        .map((e: EstablishmentStats) => ({
          ...e,
          commission: COMMISSION_RATES[e.type] || 1000,
        }))

      const totalRooms = userEstablishments.reduce(
        (acc, e) => acc + ((e as EstablishmentStats & { rooms?: unknown[] }).rooms?.length || 0),
        0
      )
      const pendingBookings = bookings.filter((b: { status: string }) => b.status === 'pending').length
      const confirmedBookings = bookings.filter((b: { status: string }) => b.status === 'confirmed').length
      const approvedEstablishments = userEstablishments.filter(e => e.isApproved).length
      const pendingEstablishments = userEstablishments.filter(e => !e.isApproved).length

      setEstablishments(userEstablishments)
      setStats({
        totalRooms,
        pendingBookings,
        confirmedBookings,
        totalEstablishments: userEstablishments.length,
        approvedEstablishments,
        pendingEstablishments,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function declarePayment(establishmentId: string) {
    setDeclaringId(establishmentId)
    try {
      const res = await fetch(`/api/establishments/${establishmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentPending: true }),
      })
      if (res.ok) {
        toast.success('Paiement déclaré ! L\'admin va vérifier votre paiement Wave.')
        setEstablishments(prev =>
          prev.map(e => e.id === establishmentId ? { ...e, paymentPending: true } : e)
        )
      } else {
        toast.error('Erreur lors de la déclaration')
      }
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setDeclaringId(null)
    }
  }

  useEffect(() => {
    if (currentUser) {
      const t = window.setTimeout(() => void fetchStats(), 0)
      return () => window.clearTimeout(t)
    }
  }, [currentUser])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    )
  }

  const unpaidCommissions = establishments.filter(e => e.isApproved && e.paymentStatus !== 'paye')
  const totalViewsAll = establishments.reduce((s, e) => s + e.viewsCount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            Bonjour, {currentUser?.fullName || 'Propriétaire'} 👋
          </h1>
          <p className="text-muted-foreground text-sm">Tableau de bord de vos annonces</p>
        </div>
        {isPro ? (
          <button
            onClick={() => setShowPlanModal(true)}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 animate-pulse" />
            <div className="text-left">
              <p className="text-xs font-semibold leading-none opacity-80">Votre plan</p>
              <p className="text-sm font-bold leading-tight">Sunu Pro ✦</p>
            </div>
          </button>
        ) : (
          <Button
            size="lg"
            className="self-start sm:self-auto gap-2 px-5 py-2.5 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-200 rounded-xl font-semibold"
            onClick={() => setShowPlanModal(true)}
          >
            <Zap className="h-5 w-5" />
            Passer à Sunu Pro
          </Button>
        )}
      </div>

      {/* Pro upsell banner for free users — contraste renforcé */}
      {!isPro && (
        <Card className="border-2 border-emerald-700 bg-linear-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 overflow-hidden shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center justify-center w-11 h-11 rounded-full bg-emerald-700 shrink-0">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base sm:text-lg text-emerald-950 dark:text-emerald-50">
                  Débloquez tout le potentiel de vos annonces
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {PRO_FEATURES.map(f => (
                    <span
                      key={f}
                      className="text-xs bg-emerald-700 text-white dark:bg-emerald-600 px-2.5 py-1 rounded-full font-semibold"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <Button
                size="sm"
                className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-md"
                onClick={() => setShowPlanModal(true)}
              >
                Voir les plans
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unpaid commission alert */}
      {unpaidCommissions.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold text-red-800 dark:text-red-300">Commission en attente</p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  Réglez via <strong>Wave au {WAVE_INFO.number}</strong> puis déclarez le paiement
                </p>
              </div>
            </div>
            <div className="space-y-2 pl-8">
              {unpaidCommissions.map(est => (
                <div key={est.id} className="flex items-center justify-between bg-white/60 dark:bg-white/5 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{est.name}</p>
                    <p className="text-xs text-muted-foreground">{getTypeLabel(est.type)}</p>
                  </div>
                  <p className="text-sm font-bold text-red-700">{est.commission.toLocaleString()} FCFA</p>
                </div>
              ))}
              <div className="flex items-center justify-between bg-white/80 dark:bg-white/10 rounded-lg px-3 py-2 border border-red-200">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">Total</p>
                <p className="text-base font-bold text-red-800 dark:text-red-300">
                  {unpaidCommissions.reduce((s, e) => s + e.commission, 0).toLocaleString()} FCFA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Établissements</p>
              <p className="text-xl font-bold">{stats?.totalEstablishments || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 shrink-0">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Vues totales</p>
              <p className="text-xl font-bold">{totalViewsAll.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 shrink-0">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">En attente</p>
              <p className="text-xl font-bold">{stats?.pendingBookings || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 shrink-0">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Confirmées</p>
              <p className="text-xl font-bold">{stats?.confirmedBookings || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending approval */}
      {(stats?.pendingEstablishments || 0) > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-300">
                {stats?.pendingEstablishments} établissement{stats?.pendingEstablishments !== 1 ? 's' : ''} en attente d&apos;approbation
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">Visible après validation par l&apos;administration</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-establishment analytics */}
      {establishments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Performance de vos annonces</h2>
          </div>
          <div className="space-y-3">
            {establishments.map(est => {
              const boostActive = est.boostExpiry && isAfter(new Date(est.boostExpiry), new Date())
              return (
                <Card key={est.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold truncate">{est.name}</p>
                          {est.isVerified && (
                            <Badge className="gap-1 bg-blue-500 text-white border-0 text-[10px] px-1.5 py-0.5">
                              <Shield className="h-2.5 w-2.5" /> Vérifié
                            </Badge>
                          )}
                          {est.isFeatured && (
                            <Badge className="gap-1 bg-amber-500 text-white border-0 text-[10px] px-1.5 py-0.5">
                              <Star className="h-2.5 w-2.5" /> Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {getTypeLabel(est.type)} · {est.city}
                          {boostActive && est.boostExpiry && (
                            <span className="ml-2 text-emerald-600">
                              · Boost jusqu&apos;au {format(new Date(est.boostExpiry), 'd MMM', { locale: fr })}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {est.isApproved ? (
                          <Badge className="gap-1 bg-green-600 text-white border-0 text-xs">
                            <CheckCircle className="h-3 w-3" /> Approuvé
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Clock className="h-3 w-3" /> En attente
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Views - visible to all */}
                      <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 p-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-blue-600">
                          <Eye className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase tracking-wide">Vues</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">{est.viewsCount.toLocaleString()}</p>
                        <Progress value={Math.min((est.viewsCount / 100) * 100, 100)} className="h-1 bg-blue-100" />
                      </div>

                      {/* WhatsApp clicks - LOCKED for non-pro */}
                      {isPro ? (
                        <div className="rounded-xl bg-green-50 dark:bg-green-950/20 p-3 space-y-1">
                          <div className="flex items-center gap-1.5 text-green-600">
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-xs font-semibold uppercase tracking-wide">Clics WhatsApp</span>
                          </div>
                          <p className="text-2xl font-bold text-green-700">{est.clicksCount.toLocaleString()}</p>
                          <Progress value={Math.min((est.clicksCount / 50) * 100, 100)} className="h-1 bg-green-100" />
                        </div>
                      ) : (
                        <div
                          className="relative rounded-xl bg-gray-100 dark:bg-gray-800/40 p-3 space-y-1 overflow-hidden cursor-pointer group"
                          onClick={() => setShowPlanModal(true)}
                        >
                          {/* Blurred content behind */}
                          <div className="blur-sm select-none pointer-events-none">
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <MessageCircle className="h-4 w-4" />
                              <span className="text-xs font-semibold uppercase tracking-wide">Clics WhatsApp</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-300">••</p>
                            <Progress value={40} className="h-1 bg-gray-200" />
                          </div>
                          {/* Lock overlay */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/70 dark:bg-black/50 backdrop-blur-[1px] group-hover:bg-white/80 transition-colors">
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white">
                              <Lock className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-[11px] font-semibold text-emerald-700 text-center leading-tight px-1">
                              Débloquer avec<br />Sunu Pro
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment declaration */}
                    {est.isApproved && est.paymentStatus !== 'paye' && (
                      <div className="border border-dashed border-emerald-300 rounded-lg p-3 bg-emerald-50/50 dark:bg-emerald-950/10">
                        {est.paymentPending ? (
                          <div className="flex items-center gap-2 text-emerald-700">
                            <Clock className="h-4 w-4 shrink-0" />
                            <div>
                              <p className="text-sm font-medium">Paiement en cours de vérification</p>
                              <p className="text-xs text-emerald-600/80">L&apos;admin va valider votre paiement Wave</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                                Activez Sunu Pro pour cette annonce
                              </p>
                              <p className="text-xs text-emerald-600/80">
                                Envoyez 5 000 FCFA via Wave au {WAVE_INFO.number}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                              disabled={declaringId === est.id}
                              onClick={() => declarePayment(est.id)}
                            >
                              {declaringId === est.id ? 'Envoi...' : 'Déclarer le paiement'}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('dashboard-establishments')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Ajouter une annonce</p>
                <p className="text-sm text-muted-foreground">Gérez vos établissements</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('dashboard-bookings')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
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

      {/* Plan selector modal */}
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent className="w-[95vw] max-w-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>Choisissez votre plan</DialogTitle>
          </DialogHeader>
          <PlanSelector onSelectPro={() => setShowPlanModal(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
