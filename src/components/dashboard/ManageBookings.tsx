'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { CalendarDays, Check, X as XIcon, Clock, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Booking {
  id: string
  guestName: string
  guestPhone: string
  startDate: string
  endDate: string
  status: string
  roomId: string
  room: { name: string; establishment: { name: string } }
}

export function ManageBookings() {
  const { currentUser } = useAppStore()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [statusFilter])

  async function fetchBookings() {
    setLoading(true)
    try {
      const res = await fetch(statusFilter && statusFilter !== 'all' ? `/api/bookings?status=${statusFilter}` : '/api/bookings')
      const data = await res.json()
      if (Array.isArray(data)) setBookings(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (bookingId: string, status: string) => {
    setActionLoading(bookingId)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Erreur')
        return
      }

      toast.success(status === 'confirmed' ? 'Réservation confirmée !' : 'Réservation annulée')
      fetchBookings()
    } catch (err) {
      console.error(err)
      toast.error('Erreur serveur')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> En attente</Badge>
      case 'confirmed':
        return <Badge className="gap-1 bg-green-600"><Check className="h-3 w-3" /> Confirmée</Badge>
      case 'cancelled':
        return <Badge variant="destructive" className="gap-1"><XIcon className="h-3 w-3" /> Annulée</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          Réservations
        </h1>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="confirmed">Confirmées</SelectItem>
              <SelectItem value="cancelled">Annulées</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <h3 className="text-lg font-semibold">Aucune réservation</h3>
            <p className="text-sm text-muted-foreground">Les réservations apparaîtront ici quand des clients réservent vos chambres</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Chambre</TableHead>
                  <TableHead>Établissement</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.guestName}</TableCell>
                    <TableCell className="text-sm">{booking.guestPhone}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{booking.room?.name || '—'}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{booking.room?.establishment?.name || '—'}</TableCell>
                    <TableCell className="text-sm">
                      <div className="space-y-0.5">
                        <div>{format(new Date(booking.startDate), 'dd MMM', { locale: fr })}</div>
                        <div className="text-muted-foreground">→ {format(new Date(booking.endDate), 'dd MMM yyyy', { locale: fr })}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell className="text-right">
                      {booking.status === 'pending' && (
                        <div className="flex items-center justify-end gap-1">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="gap-1 text-green-600 hover:text-green-700" disabled={actionLoading === booking.id}>
                                <Check className="h-3 w-3" />
                                Confirmer
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la réservation ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Confirmer la réservation de {booking.guestName} pour la chambre {booking.room?.name} ?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => updateStatus(booking.id, 'confirmed')} className="bg-green-600 hover:bg-green-700">
                                  Confirmer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="gap-1 text-destructive hover:text-destructive" disabled={actionLoading === booking.id}>
                                <XIcon className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Annuler la réservation ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Annuler la réservation de {booking.guestName} ? Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Retour</AlertDialogCancel>
                                <AlertDialogAction onClick={() => updateStatus(booking.id, 'cancelled')} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Annuler la réservation
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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
