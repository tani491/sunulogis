'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle2, XCircle, Clock, CreditCard, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface SubRequest {
  id: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  transactionDetails: string
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
    phone: string | null
    isSubscribed: boolean
    role: string
  } | null
}

interface Stats { pending: number; approved: number; rejected: number }

export function AdminSubscriptionRequests() {
  const [requests, setRequests] = useState<SubRequest[]>([])
  const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/subscription-requests')
      if (!res.ok) return
      const data = await res.json()
      setRequests(Array.isArray(data.requests) ? data.requests : [])
      setStats(data.stats ?? { pending: 0, approved: 0, rejected: 0 })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const decide = async (requestId: string, decision: 'APPROVED' | 'REJECTED') => {
    setActionId(requestId)
    try {
      const res = await fetch('/api/admin/subscriptions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, decision }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur')
        return
      }
      toast.success(data.message || 'OK')
      await load()
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setActionId(null)
    }
  }

  const pending = requests.filter(r => r.status === 'PENDING')
  const history = requests.filter(r => r.status !== 'PENDING')

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
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-emerald-600" />
          Demandes d&apos;abonnement Sunu Pro
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Validez les paiements Wave reçus pour activer l&apos;abonnement Pro.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">En attente</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100">
              <Zap className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approuvées</p>
              <p className="text-2xl font-bold text-emerald-700">{stats.approved}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rejetées</p>
              <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending */}
      <Card>
        <CardContent className="p-0">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              En attente ({pending.length})
            </h2>
          </div>
          {pending.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Aucune demande en attente
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Détails transaction</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{r.user?.name || '—'}</p>
                          <p className="text-xs text-muted-foreground">{r.user?.email}</p>
                          {r.user?.phone && (
                            <p className="text-xs text-muted-foreground">{r.user.phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(r.createdAt).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-sm max-w-[260px] break-words">
                        {r.transactionDetails || '—'}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {r.amount.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                            disabled={actionId === r.id}
                            onClick={() => decide(r.id, 'APPROVED')}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Valider
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50 gap-1"
                            disabled={actionId === r.id}
                            onClick={() => decide(r.id, 'REJECTED')}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Rejeter
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b">
              <h2 className="font-semibold">Historique</h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Détails</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <p className="font-medium">{r.user?.name || '—'}</p>
                        <p className="text-xs text-muted-foreground">{r.user?.email}</p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate">
                        {r.transactionDetails || '—'}
                      </TableCell>
                      <TableCell>{r.amount.toLocaleString()} FCFA</TableCell>
                      <TableCell>
                        {r.status === 'APPROVED' ? (
                          <Badge className="bg-emerald-100 text-emerald-800 gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Validé
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 gap-1">
                            <XCircle className="h-3 w-3" />
                            Rejeté
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
