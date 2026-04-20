'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Banknote, CheckCircle, Clock, AlertTriangle, TrendingUp, Users } from 'lucide-react'
import { toast } from 'sonner'

const COMMISSION_RATES: Record<string, number> = {
  auberge: 1000,
  hotel: 3000,
  appartement: 2500,
  appartement_meuble: 2500,
  lodge: 2500,
  loft: 2500,
}

const getTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    auberge: 'Auberge',
    hotel: 'Hôtel',
    appartement: 'Appartement',
    appartement_meuble: 'Appartement Meublé',
    lodge: 'Lodge',
    loft: 'Loft',
  }
  return types[type] || type
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    auberge: 'bg-emerald-100 text-emerald-800',
    hotel: 'bg-amber-100 text-amber-800',
    appartement: 'bg-rose-100 text-rose-800',
    appartement_meuble: 'bg-sky-100 text-sky-800',
    lodge: 'bg-orange-100 text-orange-800',
    loft: 'bg-purple-100 text-purple-800',
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

interface CommissionItem {
  id: string
  name: string
  type: string
  city: string
  region: string
  owner: { id: string; fullName: string; email: string; phone: string | null }
  roomsCount: number
  expectedCommission: number
  currentCommission: number
  paymentStatus: string
  isPaid: boolean
}

interface Stats {
  totalEstablishments: number
  totalExpected: number
  totalPaid: number
  totalUnpaid: number
  unpaidCount: number
}

export function AdminCommissions() {
  const [commissions, setCommissions] = useState<CommissionItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchCommissions()
  }, [])

  const fetchCommissions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/commissions')
      if (res.ok) {
        const data = await res.json()
        setCommissions(data.commissions)
        setStats(data.stats)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updatePaymentStatus = async (establishmentId: string, paymentStatus: string) => {
    setActionLoading(establishmentId)
    try {
      const res = await fetch('/api/admin/commissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ establishmentId, paymentStatus }),
      })
      if (res.ok) {
        toast.success(paymentStatus === 'paye' ? 'Commission marquée comme payée' : 'Commission marquée en attente')
        fetchCommissions()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erreur serveur')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredCommissions = commissions.filter((c) => {
    if (statusFilter === 'unpaid' && c.isPaid) return false
    if (statusFilter === 'paid' && !c.isPaid) return false
    return true
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Banknote className="h-6 w-6 text-primary" />
          Commissions & Revenus
        </h1>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="unpaid">Impayés</SelectItem>
            <SelectItem value="paid">Payés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenus attendus</p>
                <p className="text-2xl font-bold">{stats.totalExpected.toLocaleString()} <span className="text-sm font-normal">FCFA</span></p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Commissions payées</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalPaid.toLocaleString()} <span className="text-sm font-normal">FCFA</span></p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Impayés</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalUnpaid.toLocaleString()} <span className="text-sm font-normal">FCFA</span></p>
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
                <p className="text-2xl font-bold">{stats.unpaidCount} <span className="text-sm font-normal">établissement{stats.unpaidCount !== 1 ? 's' : ''}</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Commission rates info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-2">Barème des commissions par type d&apos;établissement</h3>
          <div className="flex flex-wrap gap-3 text-xs">
            <Badge variant="outline">Auberge : 1 000 FCFA</Badge>
            <Badge variant="outline">Hôtel : 3 000 FCFA</Badge>
            <Badge variant="outline">Appartement : 2 500 FCFA</Badge>
            <Badge variant="outline">Appartement Meublé : 2 500 FCFA</Badge>
            <Badge variant="outline">Lodge : 2 500 FCFA</Badge>
            <Badge variant="outline">Loft : 2 500 FCFA</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {filteredCommissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Banknote className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">Aucun établissement trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Établissement</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Propriétaire</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommissions.map((est) => (
                  <TableRow key={est.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{est.name}</p>
                        <p className="text-xs text-muted-foreground">{est.city}{est.region ? `, ${est.region}` : ''}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(est.type)}>{getTypeLabel(est.type)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <p>{est.owner?.fullName || '—'}</p>
                        <p className="text-xs text-muted-foreground">{est.owner?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold">{est.expectedCommission.toLocaleString()} FCFA</p>
                    </TableCell>
                    <TableCell>
                      {est.isPaid ? (
                        <Badge className="bg-green-100 text-green-800 gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Payé
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          En attente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {est.isPaid ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-yellow-600"
                          onClick={() => updatePaymentStatus(est.id, 'en_attente')}
                          disabled={actionLoading === est.id}
                        >
                          <Clock className="h-3 w-3" />
                          Marquer impayé
                        </Button>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-1 text-green-600 hover:text-green-700" disabled={actionLoading === est.id}>
                              <CheckCircle className="h-3 w-3" />
                              Confirmer paiement
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer le paiement ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Confirmer que la commission de <strong>{est.expectedCommission.toLocaleString()} FCFA</strong> pour <strong>{est.name}</strong> a été reçue via Wave ?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => updatePaymentStatus(est.id, 'paye')} className="bg-green-600 hover:bg-green-700">
                                Confirmer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
