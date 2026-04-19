'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BookingForm } from './BookingForm'
import { ArrowLeft, MapPin, Globe, Phone, Users, BedDouble, CalendarDays, ExternalLink } from 'lucide-react'

interface Room {
  id: string
  name: string
  pricePerNight: number
  capacity: number
  isAvailable: boolean
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
  phone?: string
  website?: string
  rooms: Room[]
  owner: { fullName: string; email: string; phone?: string }
}

export function EstablishmentDetailPage() {
  const { currentEstablishmentId, navigate } = useAppStore()
  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (currentEstablishmentId) {
      fetchEstablishment()
    }
  }, [currentEstablishmentId])

  const fetchEstablishment = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/establishments/${currentEstablishmentId}`)
      const data = await res.json()
      setEstablishment(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      auberge: 'Auberge',
      hotel: 'Hôtel',
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
      appartement_meuble: 'bg-sky-100 text-sky-800',
      lodge: 'bg-orange-100 text-orange-800',
      loft: 'bg-purple-100 text-purple-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (!establishment) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Établissement non trouvé</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('home')}>
          Retour à l&apos;accueil
        </Button>
      </div>
    )
  }

  const images = establishment.images || []
  const availableRooms = establishment.rooms.filter((r) => r.isAvailable)

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Button variant="ghost" className="gap-2" onClick={() => navigate('home')}>
        <ArrowLeft className="h-4 w-4" />
        Retour aux établissements
      </Button>

      {/* Image gallery */}
      <div className="space-y-4">
        <div className="relative h-64 md:h-96 rounded-xl overflow-hidden bg-muted">
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex]}
                alt={`${establishment.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        i === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <BedDouble className="h-16 w-16 text-muted-foreground/40" />
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === currentImageIndex ? 'border-primary' : 'border-transparent'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start gap-3 mb-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold">{establishment.name}</h1>
              <Badge className={getTypeColor(establishment.type)}>
                {getTypeLabel(establishment.type)}
              </Badge>
              <Badge variant="secondary">
                <MapPin className="h-3 w-3 mr-1" />
                {establishment.city}
              </Badge>
            </div>
            {establishment.region && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Région de {establishment.region}
              </p>
            )}
            <p className="text-muted-foreground leading-relaxed">{establishment.description}</p>
          </div>

          {establishment.address && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              {establishment.address}
            </div>
          )}

          {/* Website link */}
          {establishment.website && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Site web de l&apos;établissement</p>
                    <p className="text-xs text-muted-foreground">Plus d&apos;informations et photos sur leur site</p>
                  </div>
                  <a
                    href={establishment.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Visiter
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rooms */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-primary" />
              Chambres disponibles ({availableRooms.length})
            </h2>

            {availableRooms.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Aucune chambre disponible pour le moment
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {establishment.rooms.map((room) => (
                  <Card key={room.id} className={`transition-all ${room.isAvailable ? 'hover:shadow-md' : 'opacity-60'}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold">{room.name}</h3>
                        <Badge variant={room.isAvailable ? 'default' : 'secondary'}>
                          {room.isAvailable ? 'Disponible' : 'Indisponible'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {room.capacity} pers.
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {room.pricePerNight.toLocaleString()} FCFA/nuit
                        </span>
                      </div>
                      {room.isAvailable && (
                        <Button
                          size="sm"
                          className="w-full mt-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedRoom(room)
                          }}
                        >
                          Réserver
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium">{getTypeLabel(establishment.type)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ville</p>
                  <p className="text-sm font-medium">{establishment.city}{establishment.region ? `, ${establishment.region}` : ''}</p>
                </div>
              </div>

              {establishment.phone && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Téléphone</p>
                    <a
                      href={`tel:${establishment.phone}`}
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      +{establishment.phone}
                    </a>
                  </div>
                </div>
              )}

              {establishment.website && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Site web</p>
                    <a
                      href={establishment.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:text-primary transition-colors inline-flex items-center gap-1"
                    >
                      Visiter le site web
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}

              {establishment.phone && (
                <Button
                  className="w-full mt-4 gap-2"
                  variant="outline"
                  onClick={() => {
                    window.open(`https://wa.me/${establishment.phone}?text=${encodeURIComponent(`Bonjour, je souhaite avoir des informations sur ${establishment.name}.`)}`, '_blank')
                  }}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-green-600">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Contacter via WhatsApp
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                Géré par <span className="font-medium text-foreground">{establishment.owner?.fullName || 'Propriétaire'}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking form dialog */}
      {selectedRoom && establishment && (
        <BookingForm
          room={selectedRoom}
          establishment={establishment}
          open={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </div>
  )
}
