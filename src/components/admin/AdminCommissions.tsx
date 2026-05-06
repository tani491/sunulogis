'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CreditCard, Zap, Users, TrendingUp } from 'lucide-react'

interface RecentPayment {
  id: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string | null
  amount: number
  status: string
  transactionDetails: string
  paidAt: string
}

interface FreemiumStats {
  activeOwners: number
  totalOwners: number
  totalRevenue: number
  proPrice: number
}

export function AdminCommissions() {
  const [stats, setStats] = useState<FreemiumStats | null>(null)
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/admin/commissions')
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setStats(data.stats ?? null)
        setRecentPayments(Array.isArray(data.recentPayments) ? data.recentPayments : [])
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-emerald-600" />
            Revenus Sunu Pro
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Modèle Freemium · Abonnement à {stats?.proPrice.toLocaleString() ?? '15 000'} FCFA / mois
          </p>
        </div>
      </div>

      {/* Stats Freemium */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100">
                <CreditCard className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenus mensuels</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {stats.totalRevenue.toLocaleString()}{' '}
                  <span className="text-sm font-normal">FCFA</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100">
                <Zap className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Abonnés Sunu Pro</p>
                <p className="text-2xl font-bold">
                  {stats.activeOwners}{' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    propriétaire{stats.activeOwners !== 1 ? 's' : ''}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-sky-100">
                <Users className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taux de conversion</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  {stats.totalOwners > 0
                    ? Math.round((stats.activeOwners / stats.totalOwners) * 100)
                    : 0}
                  %
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {stats.activeOwners} / {stats.totalOwners} propriétaires
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Derniers paiements reçus */}
      <Card>
        <CardContent className="p-0">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Derniers paiements reçus</h2>
              <p className="text-xs text-muted-foreground">
                Demandes Sunu Pro validées les plus récentes
              </p>
            </div>
            <Badge variant="outline" className="gap-1">
              <CreditCard className="h-3 w-3" />
              {recentPayments.length}
            </Badge>
          </div>

          {recentPayments.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/40" />
              <p className="mt-4 text-muted-foreground">Aucun paiement validé pour l&apos;instant</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Propriétaire</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{p.ownerName}</p>
                          <p className="text-xs text-muted-foreground">{p.ownerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(p.paidAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                        {p.transactionDetails || '—'}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {p.amount.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-100 text-emerald-800 gap-1">
                          <Zap className="h-3 w-3" />
                          Validé
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
