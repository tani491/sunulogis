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
import { Building2, Save, Plus, X, Globe, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner'

interface Hostel {
  id: string
  name: string
  description: string
  city: string
  address: string
  images: string[]
  website?: string
  phone?: string
}

export function ManageHostel() {
  const { currentUser } = useAppStore()
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')
  const [phone, setPhone] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchHostels()
  }, [])

  const fetchHostels = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hostels')
      const data = await res.json()
      const userHostels = data.filter((h: { ownerId: string }) => h.ownerId === currentUser?.id)
      setHostels(userHostels.map((h: Hostel) => ({ ...h, images: typeof h.images === 'string' ? JSON.parse(h.images) : h.images })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setCity('')
    setAddress('')
    setWebsite('')
    setPhone('')
    setImages([])
    setImageUrl('')
    setEditingId(null)
    setShowCreate(false)
  }

  const startEdit = (hostel: Hostel) => {
    setName(hostel.name)
    setDescription(hostel.description)
    setCity(hostel.city)
    setAddress(hostel.address)
    setWebsite(hostel.website || '')
    setPhone(hostel.phone || '')
    setImages(hostel.images || [])
    setEditingId(hostel.id)
    setShowCreate(true)
  }

  const addImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()])
      setImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !city.trim()) {
      toast.error('Le nom et la ville sont requis')
      return
    }

    setSaving(true)
    try {
      const payload = { name, description, city, address, website: website || null, phone: phone || null, images }

      if (editingId) {
        const res = await fetch(`/api/hostels/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const data = await res.json()
          toast.error(data.error || 'Erreur lors de la mise à jour')
          return
        }
        toast.success('Auberge mise à jour avec succès !')
      } else {
        const res = await fetch('/api/hostels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const data = await res.json()
          toast.error(data.error || 'Erreur lors de la création')
          return
        }
        toast.success('Auberge créée avec succès !')
      }

      resetForm()
      fetchHostels()
    } catch (err) {
      console.error(err)
      toast.error('Erreur serveur')
    } finally {
      setSaving(false)
    }
  }

  const cities = ['Dakar', 'Saint-Louis', 'Saly', 'Thiès', 'Ziguinchor', 'Kaolack']

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
        <h1 className="text-2xl font-bold">Mon Auberge</h1>
        {!showCreate && (
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter une auberge
          </Button>
        )}
      </div>

      {showCreate ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Modifier l\'auberge' : 'Nouvelle auberge'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l&apos;auberge *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Auberge du Plateau" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ville *</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dakar" list="cities" required />
                  <datalist id="cities">
                    {cities.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez votre auberge..." rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="45 Rue Carnot, Plateau" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5" />
                    Site web
                  </Label>
                  <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://mon-auberge.sn" />
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
                <div className="flex gap-2">
                  <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://url-de-l-image.jpg" />
                  <Button type="button" variant="outline" onClick={addImage}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {images.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {images.map((img, i) => (
                      <div key={i} className="relative w-20 h-16 rounded-md overflow-hidden border group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Créer l\'auberge'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : hostels.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <h3 className="text-lg font-semibold">Aucune auberge</h3>
            <p className="text-sm text-muted-foreground">Créez votre première auberge pour commencer</p>
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter une auberge
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hostels.map((hostel) => (
            <Card key={hostel.id} className="overflow-hidden">
              {hostel.images && hostel.images.length > 0 && (
                <div className="h-40 overflow-hidden">
                  <img src={hostel.images[0]} alt={hostel.name} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg">{hostel.name}</h3>
                  <Badge variant="secondary">
                    <MapPin className="h-3 w-3 mr-1" />
                    {hostel.city}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{hostel.description}</p>
                {hostel.address && <p className="text-xs text-muted-foreground">{hostel.address}</p>}
                <Button size="sm" variant="outline" onClick={() => startEdit(hostel)}>
                  Modifier
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
