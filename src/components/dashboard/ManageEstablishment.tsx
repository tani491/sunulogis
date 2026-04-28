 'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, Save, Plus, Globe, Phone, MapPin, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { DragDropImageUpload } from '@/components/shared/DragDropImageUpload'
import { ESTABLISHMENT_TYPES, REGIONS, getTypeLabel } from '@/lib/constants'

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
}

export function ManageEstablishment() {
  const { currentUser } = useAppStore()
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [type, setType] = useState('auberge')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')
  const [phone, setPhone] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (currentUser) {
      fetchEstablishments()
    }
  }, [currentUser])

  async function fetchEstablishments() {
    setLoading(true)
    try {
      const res = await fetch(`/api/establishments?ownerId=${currentUser?.id}`)
      const data = await res.json()
      setEstablishments(data.map((e: Establishment) => ({ ...e, images: typeof e.images === 'string' ? JSON.parse(e.images) : e.images })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName('')
    setType('auberge')
    setDescription('')
    setCity('')
    setRegion('')
    setAddress('')
    setWebsite('')
    setPhone('')
    setImages([])
    setEditingId(null)
    setShowCreate(false)
  }

  const startEdit = (est: Establishment) => {
    setName(est.name)
    setType(est.type)
    setDescription(est.description)
    setCity(est.city)
    setRegion(est.region)
    setAddress(est.address)
    setWebsite(est.website || '')
    setPhone(est.phone || '')
    setImages(est.images || [])
    setEditingId(est.id)
    setShowCreate(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet établissement ? Cette action est irréversible.")) {
      return
    }

    try {
      const res = await fetch(`/api/establishments/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success("Établissement supprimé")
        setEstablishments(prev => prev.filter(e => e.id !== id))
      } else {
        const data = await res.json()
        toast.error(data.error || "Erreur lors de la suppression")
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !city.trim()) {
      toast.error('Le nom et la ville sont requis')
      return
    }

    setSaving(true)
    try {
      const payload = { name, type, description, city, region, address, website: website || null, phone: phone || null, images }

      if (editingId) {
        const res = await fetch(`/api/establishments/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const data = await res.json()
          toast.error(data.error || 'Erreur lors de la mise à jour')
          return
        }
        toast.success('Établissement mis à jour avec succès !')
      } else {
        const res = await fetch('/api/establishments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const data = await res.json()
          toast.error(data.error || 'Erreur lors de la création')
          return
        }
        toast.success('Établissement créé avec succès ! Il sera visible après approbation.')
      }

      resetForm()
      fetchEstablishments()
    } catch (err) {
      console.error(err)
      toast.error('Erreur serveur')
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadge = (est: Establishment) => {
    if (est.isSuspended) {
      return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> Suspendu</Badge>
    }
    if (!est.isApproved) {
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> En attente</Badge>
    }
    return <Badge className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" /> Approuvé</Badge>
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
        <h1 className="text-2xl font-bold">Mes Établissements</h1>
        {!showCreate && (
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un établissement
          </Button>
        )}
      </div>

      {showCreate ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Modifier l\'établissement' : 'Nouvel établissement'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l&apos;établissement *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Auberge du Plateau" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
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
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez votre établissement..." rows={3} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville *</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dakar" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Région</Label>
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
                  <Label htmlFor="address">Adresse</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="45 Rue Carnot, Plateau" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5" />
                    Site web
                  </Label>
                  <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://mon-etablissement.sn" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    Téléphone
                  </Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="221770000000" />
                </div>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <Label>Images</Label>
                <DragDropImageUpload
                  images={images}
                  onImagesChange={setImages}
                  maxImages={8}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Créer l\'établissement'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : establishments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <h3 className="text-lg font-semibold">Aucun établissement</h3>
            <p className="text-sm text-muted-foreground">Créez votre premier établissement pour commencer</p>
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un établissement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {establishments.map((est) => (
            <Card key={est.id} className="overflow-hidden">
              {est.images && est.images.length > 0 && (
                <div className="h-40 overflow-hidden">
                  <img src={est.images[0]} alt={est.name} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-lg">{est.name}</h3>
                  {getStatusBadge(est)}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{getTypeLabel(est.type)}</Badge>
                  <Badge variant="secondary">
                    <MapPin className="h-3 w-3 mr-1" />
                    {est.city}
                  </Badge>
                  {est.region && <Badge variant="secondary">{est.region}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{est.description}</p>
                {est.address && <p className="text-xs text-muted-foreground">{est.address}</p>}
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(est)}>
                    Modifier
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(est.id)} className="gap-2">
                    <Trash2 className="h-2 w-2" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
