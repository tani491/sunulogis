import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, BedDouble, Building2, Home, MapPin, Ruler } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PropertyContactActions } from '@/components/shared/PropertyContactActions'
import { db } from '@/lib/db'
import { getTypeColor, getTypeLabel } from '@/lib/constants'
import {
  extractIdFromPropertySlug,
  getOperationBadgeLabel,
  getOperationType,
  getPriceDisplay,
  getPropertyLocation,
  getPropertyReference,
  getPropertySlug,
} from '@/lib/real-estate'

type Props = { params: Promise<{ slug: string }> }

function safeParseImages(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw
  if (typeof raw !== 'string') return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function toPublicProperty(property: any) {
  const rooms = Array.isArray(property.rooms) ? property.rooms : []
  const availablePrices = rooms
    .filter((room: any) => room.isAvailable)
    .map((room: any) => room.pricePerNight)
    .filter((value: number) => Number.isFinite(value) && value > 0)

  return {
    ...property,
    images: safeParseImages(property.images),
    rooms,
    minPrice: availablePrices.length > 0 ? Math.min(...availablePrices) : null,
    reference: property.reference || getPropertyReference(property),
    slug: property.slug || getPropertySlug(property),
  }
}

async function getProperty(slug: string) {
  const idFallback = extractIdFromPropertySlug(slug)
  const property = await db.establishment.findFirst({
    where: {
      isApproved: true,
      isSuspended: false,
      OR: [
        { slug },
        { id: idFallback },
      ],
    },
    include: {
      rooms: { orderBy: { createdAt: 'desc' } },
    },
  })

  return property ? toPublicProperty(property) : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const property = await getProperty(slug)

  if (!property) {
    return {
      title: 'Bien introuvable',
      description: 'Ce bien SunuLogis est indisponible ou n’est plus publié.',
    }
  }

  const location = getPropertyLocation(property)
  const title = `${property.name} - ${getPriceDisplay(property)}`
  const description = property.description || `${property.name}, ${location}. Référence ${property.reference}.`
  const image = property.images[0] || '/opengraph-image'

  return {
    title,
    description,
    alternates: { canonical: `/biens/${property.slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/biens/${property.slug}`,
      images: [{ url: image, width: 1200, height: 630, alt: property.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function PropertyDetailRoute({ params }: Props) {
  const { slug } = await params
  const property = await getProperty(slug)

  if (!property) notFound()

  const images = property.images
  const location = getPropertyLocation(property)
  const operationType = getOperationType(property)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-6 pb-28 sm:pb-6">
        <Button variant="ghost" className="mb-5 gap-2" asChild>
          <Link href="/biens">
            <ArrowLeft className="h-4 w-4" />
            Retour au catalogue
          </Link>
        </Button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="relative h-72 overflow-hidden rounded-xl bg-muted md:h-[460px]">
              {images.length > 0 ? (
                <Image
                  src={images[0]}
                  alt={property.name}
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 66vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Building2 className="h-16 w-16 text-muted-foreground/40" />
                </div>
              )}
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <Badge className="bg-emerald-700 text-white">{getOperationBadgeLabel(operationType)}</Badge>
                <Badge variant="secondary">{property.reference}</Badge>
              </div>
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {images.slice(1, 6).map((image: string, index: number) => (
                  <div key={image} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                    <Image src={image} alt={`${property.name} ${index + 2}`} fill sizes="160px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            <section className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getTypeColor(property.type)}>{getTypeLabel(property.type)}</Badge>
                <Badge variant="outline">
                  <MapPin className="mr-1 h-3 w-3" />
                  {location}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold tracking-tight md:text-4xl">{property.name}</h1>
              <p className="text-2xl font-bold text-primary">{getPriceDisplay(property)}</p>
              {property.description && (
                <p className="leading-7 text-muted-foreground">{property.description}</p>
              )}
            </section>

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                    <p className="font-medium">{property.bedrooms ? `${property.bedrooms}+` : 'À préciser'}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <Ruler className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Surface</p>
                    <p className="font-medium">{property.surfaceM2 ? `${property.surfaceM2} m²` : 'À préciser'}</p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contacter SunuLogis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Référence</p>
                  <p className="font-semibold">{property.reference}</p>
                </div>
                <PropertyContactActions
                  propertyId={property.id}
                  reference={property.reference}
                  title={property.name}
                  location={location}
                  stickyMobile
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                SunuLogis agit comme apporteur d’affaires immobilier et organise la mise en relation autour de ce bien.
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}

