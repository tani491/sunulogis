'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { Pencil, Save, X, Globe, Phone, MapPin, CheckCircle, Ban, ShieldCheck, Clock, Trash2, ImagePlus, Star, PlusCircle, Banknote, ListChecks } from 'lucide-react'
import { toast } from 'sonner'
import { DragDropImageUpload } from '@/components/shared/DragDropImageUpload'
import { DAKAR_NEIGHBORHOODS, ESTABLISHMENT_TYPES, OPERATION_FILTERS, REGIONS, getTypeLabel, getTypeColor } from '@/lib/constants'
import { slugify } from '@/lib/real-estate'

const PRIMARY_ROOM_NAME = 'Offre principale'
const EQUIPMENT_SECTION_REGEX = /\n{0,2}(?:É|E)quipements\s*:\s*([\s\S]*)$/i

function splitDescriptionAndAmenities(value: string) {
  const match = value.match(EQUIPMENT_SECTION_REGEX)
  if (!match) {
    return { baseDescription: value, amenities: '' }
  }

  return {
    baseDescription: value.slice(0, match.index).trim(),
    amenities: match[1]?.trim() ?? '',
  }
}

function formatAmenities(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .join(', ')
}

function composeDescription(baseDescription: string, amenities: string) {
  const cleanDescription = baseDescription.trim()
  const cleanAmenities = formatAmenities(amenities)

  if (!cleanAmenities) return cleanDescription

  return [cleanDescription, `Équipements : ${cleanAmenities}`].filter(Boolean).join('\n\n')
}

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
  reference?: string | null
  slug?: string | null
  operationType?: 'VENTE' | 'LOCATION_MENSUELLE' | 'SEJOUR_NUITEE'
  priceAmount?: number | null
  pricePeriod?: 'MOIS' | 'NUITEE' | 'NONE' | null
  priceStatus?: 'KNOWN' | 'SUR_DEMANDE'
  bedrooms?: number | null
  surfaceM2?: number | null
  isApproved: boolean
  isSuspended: boolean
  isFeatured: boolean
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
  const [type, setType] = useState('appartement')
  const [reference, setReference] = useState('')
  const [slug, setSlug] = useState('')
  const [operationType, setOperationType] = useState<'VENTE' | 'LOCATION_MENSUELLE' | 'SEJOUR_NUITEE'>('VENTE')
  const [priceStatus, setPriceStatus] = useState<'KNOWN' | 'SUR_DEMANDE'>('KNOWN')
  const [pricePeriod, setPricePeriod] = useState<'MOIS' | 'NUITEE' | 'NONE'>('NONE')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')
  const [phone, setPhone] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [price, setPrice] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [surfaceM2, setSurfaceM2] = useState('')
  const [amenities, setAmenities] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [publishNow, setPublishNow] = useState(true)

  async function fetchEstablishment() {
    setLoading(true)
    try {
      const res = await fetch(`/api/establishments/${establishmentId}`)
      if (res.ok) {
        const data = await res.json()
        const { baseDescription, amenities: parsedAmenities } = splitDescriptionAndAmenities(data.description || '')
        const primaryRoom = data.rooms?.find((room: NonNullable<Establishment['rooms']>[number]) => room.isAvailable) || data.rooms?.[0]
        setEstablishment(data)
        setName(data.name || '')
        setType(data.type || 'appartement')
        setReference(data.reference || '')
        setSlug(data.slug || '')
        setOperationType(data.operationType || (data.type === 'maison_a_vendre' ? 'VENTE' : 'SEJOUR_NUITEE'))
        setPriceStatus(data.priceStatus || (data.priceAmount ? 'KNOWN' : 'SUR_DEMANDE'))
        setPricePeriod(data.pricePeriod || (data.operationType === 'LOCATION_MENSUELLE' ? 'MOIS' : data.operationType === 'SEJOUR_NUITEE' ? 'NUITEE' : 'NONE'))
        setDescription(baseDescription)
        setCity(data.city || '')
        setRegion(data.region || '')
        setAddress(data.address || '')
        setWebsite(data.website || '')
        setPhone(data.phone || '')
        setImages(data.images || [])
        setPrice(data.priceAmount?.toString() || primaryRoom?.pricePerNight?.toString() || '')
        setBedrooms(data.bedrooms?.toString() || '')
        setSurfaceM2(data.surfaceM2?.toString() || '')
        setAmenities(parsedAmenities)
        setIsFeatured(data.isFeatured || false)
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

  useEffect(() => {
    if (establishmentId) {
      const timeoutId = window.setTimeout(() => {
        void fetchEstablishment()
      }, 0)

      return () => window.clearTimeout(timeoutId)
    }

    const timeoutId = window.setTimeout(() => {
      setEstablishment(null)
      setName('')
      setType('appartement')
      setReference('')
      setSlug('')
      setOperationType('VENTE')
      setPriceStatus('KNOWN')
      setPricePeriod('NONE')
      setDescription('')
      setCity('')
      setRegion('')
      setAddress('')
      setWebsite('')
      setPhone('')
      setImages([])
      setPrice('')
      setBedrooms('')
      setSurfaceM2('')
      setAmenities('')
      setIsFeatured(false)
      setPublishNow(true)
      setLoading(false)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [establishmentId])

  const handleRegionChange = (value: string) => {
    setRegion(value)
    if (value === 'Dakar' && !DAKAR_NEIGHBORHOODS.includes(address)) {
      setAddress('')
    }
  }

  const savePrimaryRoom = async (targetEstablishmentId: string) => {
    const cleanPrice = price.trim()
    if (!cleanPrice || priceStatus === 'SUR_DEMANDE' || operationType === 'VENTE') return

    const numericPrice = Number(cleanPrice)
    const primaryRoom = establishment?.rooms?.find((room) => room.isAvailable) || establishment?.rooms?.[0]
    const res = await fetch(primaryRoom?.id ? `/api/rooms/${primaryRoom.id}` : '/api/rooms', {
      method: primaryRoom?.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(!primaryRoom?.id ? { establishmentId: targetEstablishmentId } : {}),
        name: primaryRoom?.name || PRIMARY_ROOM_NAME,
        pricePerNight: numericPrice,
        capacity: primaryRoom?.capacity || 1,
        isAvailable: true,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Erreur lors de la mise à jour du prix')
    }
  }

  const handleSave = async () => {
    if (!name.trim() || !city.trim()) {
      toast.error('Le nom et la ville sont requis')
      return
    }

    if (price.trim()) {
      const numericPrice = Number(price)
      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        toast.error('Le prix doit être un nombre positif')
        return
      }
    }

    if (bedrooms.trim() && (!Number.isFinite(Number(bedrooms)) || Number(bedrooms) < 0)) {
      toast.error('Le nombre de chambres doit être valide')
      return
    }

    if (surfaceM2.trim() && (!Number.isFinite(Number(surfaceM2)) || Number(surfaceM2) < 0)) {
      toast.error('La surface doit être valide')
      return
    }

    setSaving(true)
    try {
      const cleanSlug = slug.trim() || slugify(name)
      const numericPrice = priceStatus === 'KNOWN' && price.trim() ? Number(price) : null
      const payload = {
        name,
        type,
        reference: reference.trim() || null,
        slug: cleanSlug || null,
        operationType,
        priceAmount: numericPrice,
        pricePeriod: operationType === 'VENTE' ? 'NONE' : pricePeriod,
        priceStatus,
        bedrooms: bedrooms.trim() ? Number(bedrooms) : null,
        surfaceM2: surfaceM2.trim() ? Number(surfaceM2) : null,
        description: composeDescription(description, amenities),
        city,
        region,
        address,
        website: website || null,
        phone: phone || null,
        images,
        ...(establishment?.isApproved ? { isFeatured } : {}),
      }

      const res = await fetch(establishmentId ? `/api/establishments/${establishmentId}` : '/api/establishments', {
        method: establishmentId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const saved = await res.json()
        const savedId = establishmentId || saved.id

        await savePrimaryRoom(savedId)

        if (!establishmentId && publishNow) {
          const publishRes = await fetch('/api/admin/establishments', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ establishmentId: savedId, isApproved: true, isSuspended: false }),
          })

          if (!publishRes.ok) {
            const publishData = await publishRes.json().catch(() => ({}))
            throw new Error(publishData.error || 'Bien créé, mais publication impossible')
          }
        }

        toast.success(establishmentId ? 'Établissement mis à jour avec succès' : publishNow ? 'Bien créé et publié avec succès' : 'Bien créé avec succès')
        onSaved()
        if (!establishmentId) {
          onClose()
        }
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de l’enregistrement')
      }
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Erreur serveur')
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

  const isCreateMode = !establishmentId

  if (!isCreateMode && !establishment) return null

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
              {isCreateMode ? (
                <PlusCircle className="h-5 w-5 text-primary" />
              ) : (
                <Pencil className="h-5 w-5 text-primary" />
              )}
              {isCreateMode ? 'Créer un bien' : 'Modification du bien'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isCreateMode ? 'Ajouter un nouveau bien au catalogue SunuLogis.' : `Modifier l'établissement ${establishment?.name || ''}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status badges */}
          {!isCreateMode && establishment && (
            establishment.isSuspended ? (
              <Badge variant="destructive" className="gap-1"><Ban className="h-3 w-3" /> Suspendu</Badge>
            ) : !establishment.isApproved ? (
              <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3" /> En attente</Badge>
            ) : (
              <Badge className="gap-1 bg-green-600"><ShieldCheck className="h-3 w-3" /> Approuvé</Badge>
            )
          )}
          <Badge className={getTypeColor(type)}>{getTypeLabel(type)}</Badge>
        </div>
      </div>

      {/* Quick action bar - Moderation */}
      {!isCreateMode && establishment && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-sm">Actions de modération</h3>
                <p className="text-xs text-muted-foreground">Gérer le statut de publication de ce bien</p>
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
                        <AlertDialogTitle>Valider ce bien ?</AlertDialogTitle>
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
                        <AlertDialogTitle>Suspendre ce bien ?</AlertDialogTitle>
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
                        Cette action est irréversible. <strong>{establishment.name}</strong> et ses données associées seront supprimés.
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
      )}

      {/* Owner info */}
      {!isCreateMode && establishment?.owner && (
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

      {!isCreateMode && establishment && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Référence</p>
                <p className="font-bold text-lg">{reference || 'À générer'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nature</p>
                <Badge className="bg-emerald-700 text-white">
                  {OPERATION_FILTERS.find((item) => item.value === operationType)?.label || operationType}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Prix public</p>
                <p className="font-medium">{priceStatus === 'SUR_DEMANDE' ? 'Prix sur demande' : `${Number(price || 0).toLocaleString()} FCFA`}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isCreateMode ? (
              <PlusCircle className="h-5 w-5 text-primary" />
            ) : (
              <Pencil className="h-5 w-5 text-primary" />
            )}
            {isCreateMode ? 'Nouveau bien' : 'Modifier l’établissement'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin-name">Titre / Nom du bien *</Label>
                <Input id="admin-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Appartement lumineux aux Almadies" />
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin-reference">Référence</Label>
                <Input id="admin-reference" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="SL-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-slug">Slug public</Label>
                <Input id="admin-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={slugify(name || 'bien-sunulogis')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-operation">Nature de l’opération *</Label>
                <Select
                  value={operationType}
                  onValueChange={(value: 'VENTE' | 'LOCATION_MENSUELLE' | 'SEJOUR_NUITEE') => {
                    setOperationType(value)
                    setPricePeriod(value === 'VENTE' ? 'NONE' : value === 'LOCATION_MENSUELLE' ? 'MOIS' : 'NUITEE')
                  }}
                >
                  <SelectTrigger id="admin-operation" className="w-full">
                    <SelectValue placeholder="Opération" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VENTE">Vente</SelectItem>
                    <SelectItem value="LOCATION_MENSUELLE">Location mensuelle</SelectItem>
                    <SelectItem value="SEJOUR_NUITEE">Séjour à la nuitée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-description">Description</Label>
              <Textarea id="admin-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez le bien, son ambiance, ses pièces et ses points forts..." rows={4} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-amenities" className="flex items-center gap-2">
                <ListChecks className="h-3.5 w-3.5" />
                Équipements
              </Label>
              <Textarea
                id="admin-amenities"
                value={amenities}
                onChange={(e) => setAmenities(e.target.value)}
                placeholder="Wi-Fi, climatisation, cuisine équipée, parking, gardiennage..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin-city" className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  Ville *
                </Label>
                <Input id="admin-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dakar" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-region">Région</Label>
                <Select value={region} onValueChange={handleRegionChange}>
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
                <Label htmlFor="admin-address">{region === 'Dakar' ? 'Quartier' : 'Adresse'}</Label>
                {region === 'Dakar' ? (
                  <Select value={address} onValueChange={setAddress}>
                    <SelectTrigger id="admin-address" className="w-full">
                      <SelectValue placeholder="Sélectionner un quartier" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAKAR_NEIGHBORHOODS.map((neighborhood) => (
                        <SelectItem key={neighborhood} value={neighborhood}>{neighborhood}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input id="admin-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="45 Rue Carnot, Plateau" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin-price" className="flex items-center gap-2">
                  <Banknote className="h-3.5 w-3.5" />
                  Prix public
                </Label>
                <Input
                  id="admin-price"
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="157200000"
                  disabled={priceStatus === 'SUR_DEMANDE'}
                />
              </div>
              <div className="space-y-2">
                <Label>Statut du prix</Label>
                <Select value={priceStatus} onValueChange={(value: 'KNOWN' | 'SUR_DEMANDE') => setPriceStatus(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KNOWN">Prix connu</SelectItem>
                    <SelectItem value="SUR_DEMANDE">Prix sur demande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Période</Label>
                <Select value={pricePeriod} onValueChange={(value: 'MOIS' | 'NUITEE' | 'NONE') => setPricePeriod(value)} disabled={operationType === 'VENTE'}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Aucune</SelectItem>
                    <SelectItem value="MOIS">Mois</SelectItem>
                    <SelectItem value="NUITEE">Nuitée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-bedrooms">Chambres</Label>
                <Input id="admin-bedrooms" type="number" min="0" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="3" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin-surface">Surface m²</Label>
                <Input id="admin-surface" type="number" min="0" value={surfaceM2} onChange={(e) => setSurfaceM2(e.target.value)} placeholder="120" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-website" className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" />
                  Site web / dossier
                </Label>
                <Input id="admin-website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-phone" className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  Téléphone
                </Label>
                <Input id="admin-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="221770000000" />
              </div>
            </div>

            {!isCreateMode && establishment?.isApproved && (
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Checkbox
                  id="admin-featured"
                  checked={isFeatured}
                  onCheckedChange={(checked) => setIsFeatured(checked === true)}
                />
                <label
                  htmlFor="admin-featured"
                  className="flex items-center gap-2 text-sm font-medium leading-none cursor-pointer"
                >
                  <Star className="h-4 w-4 text-amber-500" />
                  Mettre ce bien en vedette
                </label>
              </div>
            )}

            {/* Image management */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImagePlus className="h-3.5 w-3.5" />
                Gestion des images
              </Label>
              <p className="text-xs text-muted-foreground">
                Ajoutez plusieurs photos et choisissez la première comme image de couverture.
              </p>
              <DragDropImageUpload
                images={images}
                onImagesChange={setImages}
                maxImages={8}
              />
            </div>

            {isCreateMode && (
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Checkbox
                  id="admin-publish-now"
                  checked={publishNow}
                  onCheckedChange={(checked) => setPublishNow(checked === true)}
                />
                <label
                  htmlFor="admin-publish-now"
                  className="flex items-center gap-2 text-sm font-medium leading-none cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Publier immédiatement le bien
                </label>
              </div>
            )}

            {/* Save/Cancel */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Enregistrement...' : isCreateMode ? 'Créer le bien' : 'Enregistrer les modifications'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legacy room data summary */}
      {!isCreateMode && establishment?.rooms && establishment.rooms.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Offres héritées ({establishment.rooms.length})
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
                    <span className="font-semibold">{room.pricePerNight.toLocaleString()} FCFA</span>
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
