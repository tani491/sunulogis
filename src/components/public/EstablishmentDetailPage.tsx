'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, MapPin, Phone, BedDouble, Home, Ruler } from 'lucide-react'
import { SUNULOGIS_CONTACT, getTypeLabel, getTypeColor } from '@/lib/constants'
import { parseJsonResponse } from '@/lib/fetch-json'
import { PropertyContactActions } from '@/components/shared/PropertyContactActions'
import { getOperationBadgeLabel, getOperationType, getPriceDisplay, getPropertyLocation, getPropertyReference } from '@/lib/real-estate'

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
  reference?: string | null
  operationType?: string | null
  priceAmount?: number | null
  pricePeriod?: string | null
  priceStatus?: string | null
  bedrooms?: number | null
  surfaceM2?: number | null
  minPrice?: number | null
  rooms: Room[]
}

export function EstablishmentDetailPage() {
  const { currentEstablishmentId, navigate } = useAppStore()
  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  async function fetchEstablishment() {
    setLoading(true)
    try {
      const res = await fetch(`/api/establishments/${currentEstablishmentId}`)
      const data = await parseJsonResponse<Establishment>(res)
      setEstablishment(data)
      void fetch(`/api/establishments/${currentEstablishmentId}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'view' }),
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentEstablishmentId) {
      const timeoutId = window.setTimeout(() => {
        void fetchEstablishment()
      }, 0)

      return () => window.clearTimeout(timeoutId)
    }
  }, [currentEstablishmentId])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
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
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Etablissement non trouve</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('home')}>
          Retour a l'accueil
        </Button>
      </div>
    )
  }

  const images = establishment.images || []
  const contactLocation = getPropertyLocation(establishment)
  const reference = getPropertyReference(establishment)
  const operationType = getOperationType(establishment)

  return (
    <div className="space-y-8">
      <Button variant="ghost" className="gap-2" onClick={() => navigate('home')}>
        <ArrowLeft className="h-4 w-4" />
        Retour aux etablissements
      </Button>

      <div className="space-y-4">
        <div className="relative h-64 overflow-hidden rounded-xl bg-muted md:h-96">
          {images.length > 0 ? (
            <>
              <Image
                src={images[currentImageIndex]}
                alt={`${establishment.name} - Image ${currentImageIndex + 1}`}
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 66vw"
                className="object-cover"
              />
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`h-3 w-3 rounded-full transition-colors ${
                        i === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
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
                className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                  i === currentImageIndex ? 'border-primary' : 'border-transparent'
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="mb-3 flex flex-wrap items-start gap-3">
              <h1 className="text-2xl font-bold md:text-3xl">{establishment.name}</h1>
              <Badge className={getTypeColor(establishment.type)}>
                {getTypeLabel(establishment.type)}
              </Badge>
              <Badge className="bg-emerald-700 text-white">
                {getOperationBadgeLabel(operationType)}
              </Badge>
              <Badge variant="secondary">
                <MapPin className="mr-1 h-3 w-3" />
                {establishment.city}
              </Badge>
            </div>

            {establishment.region && (
              <p className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Region de {establishment.region}
              </p>
            )}

            <p className="leading-relaxed text-muted-foreground">{establishment.description}</p>
            <p className="mt-4 text-2xl font-bold text-primary">{getPriceDisplay(establishment)}</p>
          </div>

          {establishment.address && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              {establishment.address}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Home className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Opération</p>
                  <p className="font-medium">{getOperationBadgeLabel(operationType)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <BedDouble className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Chambres</p>
                  <p className="font-medium">{establishment.bedrooms ? `${establishment.bedrooms}+` : 'À préciser'}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Ruler className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Surface</p>
                  <p className="font-medium">{establishment.surfaceM2 ? `${establishment.surfaceM2} m²` : 'À préciser'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium">{getTypeLabel(establishment.type)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Référence</p>
                <p className="text-sm font-semibold">{reference}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ville</p>
                  <p className="text-sm font-medium">
                    {establishment.city}
                    {establishment.region ? `, ${establishment.region}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contact SunuLogis</p>
                  <a
                    href={`tel:${SUNULOGIS_CONTACT.phoneHref}`}
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    {SUNULOGIS_CONTACT.phoneDisplay}
                  </a>
                </div>
              </div>

              <PropertyContactActions
                propertyId={establishment.id}
                reference={reference}
                title={establishment.name}
                location={contactLocation}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                Mise en relation gérée par <span className="font-medium text-foreground">SunuLogis</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
