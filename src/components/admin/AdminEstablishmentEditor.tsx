'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { Pencil, Save, X, Globe, Phone, MapPin, CheckCircle, Ban, ShieldCheck, Clock, Trash2, ImagePlus } from 'lucide-react'
import { toast } from 'sonner'
import { DragDropImageUpload } from '@/components/shared/DragDropImageUpload'
import { ESTABLISHMENT_TYPES, REGIONS, getTypeLabel, getTypeColor, WAVE_INFO, getCommissionAmount, PAYMENT_STATUSES } from '@/lib/constants'

interface Establishment {
  id: string
  name: string
  type: string
  description: string
  city: string
  region: string
  address: string
  images: string[]
  website?: string
  phone?: string
  isApproved: boolean
  isSuspended: boolean
  commission: number
  paymentStatus: string
  ownerId: string
  owner?: { id: string; fullName: string; email: string; phone?: string | null }
  rooms?: { id: string; name: string; pricePerNight: number; capacity: number; isAvailable: boolean }[]
  createdAt: string
}

interface Props {
  establishmentId: string | null
  onClose: () => void
  onSaved: () => void
}

export function AdminEstablishmentEditor({ establishmentId, onClose, onSaved }: Props) {
  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form fields
  const [name, setName] = useState('')
  const [type, setType] = useState('auberge')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')
  const [phone, setPhone] = useState('')
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    if (establishmentId) {
      fetchEstablishment()
    }
  }, [establishmentId])

  const fetchEstablishment = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/establishments/${establishmentId}`)
      if (res.ok) {
        const data = await res.json()
        setEstablishment(data)
        setName(data.name || '')
        setType(data.type || 'auberge')
        setDescription(data.description || '')
        setCity(data.city || '')
        setRegion(data.region || '')
        setAddress(data.address || '')
        setWebsite(data.website || '')
        setPhone(data.phone || '')
        setImages(data.images || [])
      } else {
        toast.error('Établissement non trouvé')
        onClose()
      }
    } catch (err) {
      console.error(err)
      toast.error('Erreur de chargement')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!name.trim() || !city.trim()) {
      toast.error('Le nom et la ville sont requis')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/establishments/${establishmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, type, description, city, region, address,
          website: website || null, phone: phone || null, images,
        }),
      })

      if (res.ok) {
        toast.success('Établissement mis à jour avec succès')
        onSaved()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erreur serveur')
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async () => {
    try {
      const res = await fetch('/api/admin/establishments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ establishmentId, isApproved: true }),
      })
      if (res.ok) {
        toast.success('Établissement approuvé et publié')
        onSaved()
        onClose()
      } else {
        toast.error('Erreur')
      }
    } catch (err) {
      toast.error('Erreur serveur')
    }
  }

  const handleSuspend = async () => {
    try {
      const res = await fetch('/api/admin/establishments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ establishmentId, isSuspended: true }),
      })
      if (res.ok) {
        toast.success('Établissement suspendu')
        onSaved()
        onClose()
      } else {
        toast.error('Erreur')
      }
    } catch (err) {
      toast.error('Erreur serveur')
    }
  }

  const handleReactivate = async () => {
    try {
      const res = await fetch('/api/admin/establishments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ establishmentId, isSuspended: false }),
      })
      if (res.ok) {
        toast.success('Établissement réactivé')
        onSaved()
        onClose()
      } else {
        toast.error('Erreur')
      }
    } catch (err) {
      toast.error('Erreur serveur')
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/establishments/${establishmentId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Établissement supprimé')
        onSaved()
        onClose()
      } else {
        toast.error('Erreur')
      }
    } catch (err) {
      toast.error('Erreur serveur')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!establishment) return null

  const expectedCommission = getCommissionAmount(establishment.type)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Modification Super Admin
            </h1>
            <p className="text-sm text-muted-foreground">
              Modifier l&apos;établissement de {establishment.owner?.fullName || 'un propriétaire'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status badges */}
          {establishment.isSuspended ? (
            <Badge variant="destructive" className="gap-1"><Ban className="h-3 w-3" /> Suspendu</Badge>
          ) : !establishment.isApproved ? (
            <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3" /> En attente</Badge>
          ) : (
            <Badge className="gap-1 bg-green-600"><ShieldCheck className="h-3 w-3" /> Approuvé</Badge>
          )}
          <Badge className={getTypeColor(establishment.type)}>{getTypeLabel(establishment.type)}</Badge>
        </div>
      </div>

      {/* Quick action bar - Moderation */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-sm">Actions de modération</h3>
              <p className="text-xs text-muted-foreground">Gérer le statut de cet établissement</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {!establishment.isApproved && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4" />
                      Valider & Publier
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Valider cet établissement ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Approuver <strong>{establishment.name}</strong> ? Il sera visible publiquement sur le site après validation.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                        Valider
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {!establishment.isSuspended ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1 text-destructive hover:text-destructive">
                      <Ban className="h-4 w-4" />
                      Suspendre
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Suspendre cet établissement ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Suspendre <strong>{establishment.name}</strong> ? Il ne sera plus visible publiquement.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSuspend} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Suspendre
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button size="sm" variant="outline" className="gap-1 text-green-600" onClick={handleReactivate}>
                  <ShieldCheck className="h-4 w-4" />
                  Réactiver
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer définitivement ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. <strong>{establishment.name}</strong> et toutes ses chambres et réservations seront supprimés.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Owner info */}
      {establishment.owner && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Informations du propriétaire</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Nom</p>
                <p className="font-medium">{establishment.owner.fullName || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{establishment.owner.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Téléphone</p>
                <p className="font-medium">{establishment.owner.phone || '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commission info */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Commission attendue</p>
              <p className="font-bold text-lg">{expectedCommission.toLocaleString()} FCFA</p>
            </div>
            <div>
              <p className="text-muted-foreground">Statut de paiement</p>
              <Badge className={establishment.paymentStatus === 'paye' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {PAYMENT_STATUSES[establishment.paymentStatus as keyof typeof PAYMENT_STATUSES] || establishment.paymentStatus}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Paiement Wave</p>
              <p className="font-medium">{WAVE_INFO.number} ({WAVE_INFO.name})</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Modifier l&apos;établissement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin-name">Nom de l&apos;établissement *</Label>
                <Input id="admin-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Auberge du Plateau" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-type">Type *</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTABLISHMENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-description">Description</Label>
              <Textarea id="admin-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez l'établissement..." rows={4} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin-city">Ville *</Label>
                <Input id="admin-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dakar" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-region">Région</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une région" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-address">Adresse</Label>
                <Input id="admin-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="45 Rue Carnot, Plateau" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin-website" className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" />
                  Site web
                </Label>
                <Input id="admin-website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://mon-etablissement.sn" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-phone" className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  Téléphone
                </Label>
                <Input id="admin-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="221770000000" />
              </div>
            </div>

            {/* Image management */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImagePlus className="h-3.5 w-3.5" />
                Gestion des images
              </Label>
              <p className="text-xs text-muted-foreground">
                Remplacez les photos floues par des images plus nettes, ou supprimez celles qui ne conviennent pas.
              </p>
              <DragDropImageUpload
                images={images}
                onImagesChange={setImages}
                maxImages={8}
              />
            </div>

            {/* Save/Cancel */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rooms summary */}
      {establishment.rooms && establishment.rooms.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Chambres ({establishment.rooms.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-2">
              {establishment.rooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between p-2 rounded border text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{room.name}</span>
                    <Badge variant="outline">{room.capacity} pers.</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{room.pricePerNight.toLocaleString()} FCFA/nuit</span>
                    <Badge className={room.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {room.isAvailable ? 'Disponible' : 'Indisponible'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
