'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Building2, Check, X, Ban, ShieldCheck, Filter, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { ESTABLISHMENT_TYPE_FILTERS, getTypeLabel, getTypeColor } from '@/lib/constants'

interface Establishment {
  id: string
  name: string
  type: string
  city: string
  region: string
  isApproved: boolean
  isSuspended: boolean
  minPrice: number | null
  owner: { id: string; fullName: string; email: string }
  rooms: { id: string }[]
}

export function AdminEstablishments() {
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchEstablishments()
  }, [])

  const fetchEstablishments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/establishments')
      if (res.ok) {
        const data = await res.json()
        setEstablishments(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateEstablishment = async (establishmentId: string, updates: { isApproved?: boolean; isSuspended?: boolean }) => {
    setActionLoading(establishmentId)
    try {
      const res = await fetch('/api/admin/establishments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ establishmentId, ...updates }),
      })

      if (res.ok) {
        toast.success('Établissement mis à jour')
        fetchEstablishments()
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

  const getStatusBadge = (est: Establishment) => {
    if (est.isSuspended) {
      return <Badge variant="destructive" className="gap-1"><Ban className="h-3 w-3" /> Suspendu</Badge>
    }
    if (!est.isApproved) {
      return <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800"><X className="h-3 w-3" /> En attente</Badge>
    }
    return <Badge className="gap-1 bg-green-600"><ShieldCheck className="h-3 w-3" /> Approuvé</Badge>
  }

  const filteredEstablishments = establishments.filter((est) => {
    if (statusFilter === 'pending' && est.isApproved) return false
    if (statusFilter === 'approved' && (!est.isApproved || est.isSuspended)) return false
    if (statusFilter === 'suspended' && !est.isSuspended) return false
    if (typeFilter !== 'all' && est.type !== typeFilter) return false
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
          <Building2 className="h-6 w-6 text-primary" />
          Établissements ({establishments.length})
        </h1>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="approved">Approuvés</SelectItem>
              <SelectItem value="suspended">Suspendus</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {ESTABLISHMENT_TYPE_FILTERS.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredEstablishments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">Aucun établissement trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Propriétaire</TableHead>
                  <TableHead>Chambres</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstablishments.map((est) => (
                  <TableRow key={est.id}>
                    <TableCell className="font-medium">{est.name}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(est.type)}>{getTypeLabel(est.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {est.city}{est.region ? `, ${est.region}` : ''}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{est.owner?.fullName || '—'}</TableCell>
                    <TableCell>{est.rooms?.length || 0}</TableCell>
                    <TableCell>{getStatusBadge(est)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!est.isApproved && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="gap-1 text-green-600 hover:text-green-700" disabled={actionLoading === est.id}>
                                <Check className="h-3 w-3" />
                                Approuver
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Approuver l&apos;établissement ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Approuver {est.name} ? Il sera visible publiquement.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => updateEstablishment(est.id, { isApproved: true })} className="bg-green-600 hover:bg-green-700">
                                  Approuver
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {!est.isSuspended ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="gap-1 text-destructive hover:text-destructive" disabled={actionLoading === est.id}>
                                <Ban className="h-3 w-3" />
                                Suspendre
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Suspendre l&apos;établissement ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Suspendre {est.name} ? Il ne sera plus visible publiquement.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => updateEstablishment(est.id, { isSuspended: true })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Suspendre
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-green-600 hover:text-green-700"
                            onClick={() => updateEstablishment(est.id, { isSuspended: false })}
                            disabled={actionLoading === est.id}
                          >
                            <ShieldCheck className="h-3 w-3" />
                            Réactiver
                          </Button>
                        )}
                      </div>
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
