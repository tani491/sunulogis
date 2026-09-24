'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Building2, Check, Ban, ShieldCheck, Filter, MapPin, Eye, Clock, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { ESTABLISHMENT_TYPE_FILTERS, getTypeLabel, getTypeColor } from '@/lib/constants'
import { AdminEstablishmentEditor } from './AdminEstablishmentEditor'
import { getOperationBadgeLabel, getOperationType, getPriceDisplay } from '@/lib/real-estate'

interface Establishment {
  id: string
  name: string
  type: string
  city: string
  region: string
  description: string
  images: string[]
  isApproved: boolean
  isSuspended: boolean
  isFeatured: boolean
  reference?: string | null
  operationType?: string | null
  priceAmount?: number | null
  pricePeriod?: string | null
  priceStatus?: string | null
  bedrooms?: number | null
  minPrice: number | null
  owner: { id: string; fullName: string; email: string; phone?: string | null }
  rooms: { id: string }[]
}

export function AdminEstablishments() {
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchEstablishments()
  }, [])

  async function fetchEstablishments() {
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

  const updateEstablishment = async (establishmentId: string, updates: { isApproved?: boolean; isSuspended?: boolean; isFeatured?: boolean }) => {
    setActionLoading(establishmentId)
    try {
      const res = await fetch('/api/admin/establishments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ establishmentId, ...updates }),
      })

      if (res.ok) {
        toast.success('Bien mis à jour')
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
      return <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3" /> En attente</Badge>
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

  // Count pending
  const pendingCount = establishments.filter(e => !e.isApproved).length

  // If creating or editing an establishment, show the editor
  if (isCreating || editingId) {
    return (
      <AdminEstablishmentEditor
        establishmentId={editingId}
        onClose={() => {
          setEditingId(null)
          setIsCreating(false)
        }}
        onSaved={fetchEstablishments}
      />
    )
  }

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
      {/* Pending alert */}
      {pendingCount > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  {pendingCount} bien{pendingCount !== 1 ? 's' : ''} en attente de validation
                </p>
                <p className="text-sm text-yellow-700">
                  Cliquez sur &quot;Examiner&quot; pour voir les détails, modifier les photos si nécessaire, puis valider ou rejeter.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setStatusFilter('pending')}
              variant="outline"
              className="w-full gap-2 border-yellow-300 text-yellow-800 hover:bg-yellow-100 sm:w-auto"
            >
              <Eye className="h-4 w-4" />
              Voir les en attente
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Biens / Établissements ({establishments.length})
          </h1>
          <p className="text-sm text-muted-foreground">Créer et gérer les biens publiés dans le catalogue SunuLogis.</p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button
            onClick={() => {
              setEditingId(null)
              setIsCreating(true)
            }}
            className="w-full gap-2 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Ajouter un nouveau bien
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filtres
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
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
            <SelectTrigger className="w-full sm:w-44">
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
            <p className="mt-4 text-muted-foreground">Aucun bien trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filteredEstablishments.map((est) => (
              <Card key={est.id} className={!est.isApproved ? 'bg-yellow-50/50' : ''}>
                <CardContent className="space-y-4 p-4">
                  <div className="flex gap-3">
                    {est.images && est.images.length > 0 ? (
                      <Image
                        src={est.images[0]}
                        alt={est.name}
                        width={64}
                        height={64}
                        sizes="64px"
                        className="h-16 w-16 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-muted">
                        <Building2 className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start gap-2">
                        <h3 className="font-semibold leading-tight">{est.name}</h3>
                        {getStatusBadge(est)}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{est.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <Badge className={getTypeColor(est.type)}>{getTypeLabel(est.type)}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Opération</p>
                      <Badge className="bg-emerald-700 text-white">{getOperationBadgeLabel(getOperationType(est))}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Prix</p>
                      <p className="font-medium">{getPriceDisplay(est)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Localisation</p>
                      <p className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {est.city}{est.region ? `, ${est.region}` : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Contact associé</p>
                      <p className="font-medium">{est.owner?.fullName || '—'}</p>
                      <p className="break-all text-xs text-muted-foreground">{est.owner?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Chambres</p>
                      <p className="font-medium">{est.bedrooms || '—'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="col-span-2 gap-2 bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white"
                      onClick={() => setEditingId(est.id)}
                      disabled={actionLoading === est.id}
                    >
                      <Eye className="h-4 w-4" />
                      {!est.isApproved ? 'Examiner' : 'Modifier'}
                    </Button>

                    {!est.isApproved && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="gap-1 text-green-600 hover:text-green-700" disabled={actionLoading === est.id}>
                            <Check className="h-3 w-3" />
                            Valider
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Valider le bien ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Approuver {est.name} ? Il sera visible publiquement sur le site.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => updateEstablishment(est.id, { isApproved: true })}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Valider
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
                            <AlertDialogTitle>Suspendre le bien ?</AlertDialogTitle>
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
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="hidden md:block">
            <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <Table className="min-w-[920px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Opération</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstablishments.map((est) => (
                  <TableRow key={est.id} className={!est.isApproved ? 'bg-yellow-50/50' : ''}>
                    <TableCell>
                      {est.images && est.images.length > 0 ? (
                        <Image
                          src={est.images[0]}
                          alt={est.name}
                          width={48}
                          height={48}
                          sizes="48px"
                          className="h-12 w-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-muted-foreground/40" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{est.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{est.description?.substring(0, 60)}{est.description?.length > 60 ? '...' : ''}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 h-9 w-9 p-0 bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white sm:w-auto sm:px-3 sm:gap-1"
                          onClick={() => setEditingId(est.id)}
                          disabled={actionLoading === est.id}
                          aria-label={!est.isApproved ? 'Examiner' : 'Modifier'}
                          title={!est.isApproved ? 'Examiner' : 'Modifier'}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">{!est.isApproved ? 'Examiner' : 'Modifier'}</span>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(est.type)}>{getTypeLabel(est.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {est.city}{est.region ? `, ${est.region}` : ''}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-700 text-white">{getOperationBadgeLabel(getOperationType(est))}</Badge>
                      {est.bedrooms ? <p className="mt-1 text-xs text-muted-foreground">{est.bedrooms} chambre{est.bedrooms !== 1 ? 's' : ''}</p> : null}
                    </TableCell>
                    <TableCell className="font-medium">{getPriceDisplay(est)}</TableCell>
                    <TableCell>{getStatusBadge(est)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!est.isApproved && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="gap-1 text-green-600 hover:text-green-700" disabled={actionLoading === est.id}>
                                <Check className="h-3 w-3" />
                                Valider
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Valider l&apos;établissement ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Approuver {est.name} ? Il sera visible publiquement sur le site.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => updateEstablishment(est.id, { isApproved: true })}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Valider
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        {!est.isSuspended ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="gap-1 text-destructive hover:text-destructive" disabled={actionLoading === est.id}>
                                <Ban className="h-3 w-3" />
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
                            variant="ghost"
                            className="gap-1 text-green-600 hover:text-green-700"
                            onClick={() => updateEstablishment(est.id, { isSuspended: false })}
                            disabled={actionLoading === est.id}
                          >
                            <ShieldCheck className="h-3 w-3" />
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
        </>
      )}
    </div>
  )
}
