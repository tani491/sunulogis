'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BedDouble, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Room {
  id: string
  name: string
  pricePerNight: number
  capacity: number
  isAvailable: boolean
  establishmentId: string
  establishment?: { name: string; id: string }
}

interface Establishment {
  id: string
  name: string
  rooms: Room[]
}

export function ManageRooms() {
  const { currentUser } = useAppStore()
  const [rooms, setRooms] = useState<Room[]>([])
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)

  // Form
  const [name, setName] = useState('')
  const [pricePerNight, setPricePerNight] = useState('')
  const [capacity, setCapacity] = useState('1')
  const [isAvailable, setIsAvailable] = useState(true)
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (currentUser) {
      fetchData()
    }
  }, [currentUser])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/establishments?ownerId=${currentUser?.id}`)
      const data = await res.json()
      setEstablishments(data)

      // Get all rooms for user establishments
      const allRooms: Room[] = []
      for (const est of data) {
        const roomsRes = await fetch(`/api/rooms?establishmentId=${est.id}`)
        const estRooms = await roomsRes.json()
        allRooms.push(...estRooms.map((r: Room) => ({ ...r, establishment: { name: est.name, id: est.id } })))
      }
      setRooms(allRooms)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setName('')
    setPricePerNight('')
    setCapacity('1')
    setIsAvailable(true)
    // Auto-select the first establishment if there's only one
    setSelectedEstablishmentId(establishments.length === 1 ? establishments[0].id : '')
    setEditingRoom(null)
    setShowDialog(true)
  }

  const resetForm = () => {
    setName('')
    setPricePerNight('')
    setCapacity('1')
    setIsAvailable(true)
    setSelectedEstablishmentId('')
    setEditingRoom(null)
    setShowDialog(false)
  }

  const startEdit = (room: Room) => {
    setName(room.name)
    setPricePerNight(room.pricePerNight.toString())
    setCapacity(room.capacity.toString())
    setIsAvailable(room.isAvailable)
    setSelectedEstablishmentId(room.establishmentId)
    setEditingRoom(room)
    setShowDialog(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !pricePerNight) {
      toast.error('Le nom et le prix sont requis')
      return
    }

    if (!editingRoom && !selectedEstablishmentId) {
      toast.error('Sélectionnez un établissement')
      return
    }

    setSaving(true)
    try {
      if (editingRoom) {
        const res = await fetch(`/api/rooms/${editingRoom.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, pricePerNight: Number(pricePerNight), capacity: Number(capacity), isAvailable }),
        })
        if (!res.ok) {
          const data = await res.json()
          toast.error(data.error || 'Erreur')
          return
        }
        toast.success('Chambre mise à jour !')
      } else {
        const res = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ establishmentId: selectedEstablishmentId, name, pricePerNight: Number(pricePerNight), capacity: Number(capacity), isAvailable }),
        })
        if (!res.ok) {
          const data = await res.json()
          toast.error(data.error || 'Erreur')
          return
        }
        toast.success('Chambre créée !')
      }

      resetForm()
      fetchData()
    } catch (err) {
      console.error(err)
      toast.error('Erreur serveur')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (roomId: string) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error('Erreur lors de la suppression')
        return
      }
      toast.success('Chambre supprimée')
      fetchData()
    } catch (err) {
      console.error(err)
      toast.error('Erreur serveur')
    }
  }

  const toggleAvailability = async (room: Room) => {
    try {
      const res = await fetch(`/api/rooms/${room.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !room.isAvailable }),
      })
      if (!res.ok) {
        toast.error('Erreur')
        return
      }
      toast.success(room.isAvailable ? 'Chambre marquée indisponible' : 'Chambre marquée disponible')
      fetchData()
    } catch (err) {
      console.error(err)
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BedDouble className="h-6 w-6 text-primary" />
          Chambres
        </h1>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>

      {establishments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Créez d&apos;abord un établissement avant d&apos;ajouter des chambres</p>
          </CardContent>
        </Card>
      ) : rooms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <BedDouble className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <h3 className="text-lg font-semibold">Aucune chambre</h3>
            <p className="text-sm text-muted-foreground">Ajoutez votre première chambre</p>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter une chambre
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Établissement</TableHead>
                  <TableHead>Prix/nuit</TableHead>
                  <TableHead>Capacité</TableHead>
                  <TableHead>Disponible</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{room.establishment?.name || '—'}</Badge>
                    </TableCell>
                    <TableCell>{room.pricePerNight.toLocaleString()} FCFA</TableCell>
                    <TableCell>{room.capacity} pers.</TableCell>
                    <TableCell>
                      <Switch
                        checked={room.isAvailable}
                        onCheckedChange={() => toggleAvailability(room)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(room)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer la chambre ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. Toutes les réservations associées seront également supprimées.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(room.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={showDialog} onOpenChange={(v) => { if (!v) resetForm() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Modifier la chambre' : 'Nouvelle chambre'}</DialogTitle>
            <DialogDescription>
              {editingRoom ? 'Modifiez les informations de la chambre' : 'Ajoutez une nouvelle chambre à votre établissement'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingRoom && (
              <div className="space-y-2">
                <Label>Établissement *</Label>
                {establishments.length === 0 ? (
                  <div className="rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
                    Vous devez d&apos;abord créer un établissement pour pouvoir ajouter des chambres.
                  </div>
                ) : (
                  <Select value={selectedEstablishmentId} onValueChange={setSelectedEstablishmentId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un établissement" />
                    </SelectTrigger>
                    <SelectContent>
                      {establishments.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="roomName">Nom de la chambre *</Label>
              <Input id="roomName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Chambre Double Confort" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="price">Prix par nuit (FCFA) *</Label>
                <Input id="price" type="number" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} placeholder="25000" min="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacité</Label>
                <Input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} min="1" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={isAvailable} onCheckedChange={setIsAvailable} id="available" />
              <Label htmlFor="available">Disponible</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Enregistrement...' : editingRoom ? 'Mettre à jour' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
