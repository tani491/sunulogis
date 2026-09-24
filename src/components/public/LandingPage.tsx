'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Search, MapPin, ArrowRight, Home, CalendarCheck, Star } from 'lucide-react';
import { getTypeLabel, getTypeColor } from '@/lib/constants';
import { parseJsonResponse } from '@/lib/fetch-json';
import { CustomSearchRequestForm } from './CustomSearchRequestForm';
import { getOperationBadgeLabel, getOperationType, getPriceDisplay, getPropertySlug } from '@/lib/real-estate';

const heroImages = [
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
];

interface Establishment {
  id: string;
  name: string;
  type: string;
  description: string;
  city: string;
  region: string;
  images: string[];
  slug?: string | null;
  operationType?: string | null;
  priceAmount?: number | null;
  pricePeriod?: string | null;
  priceStatus?: string | null;
  minPrice: number | null;
  isFeatured: boolean;
  rooms: { id: string; isAvailable: boolean }[];
}

interface EstablishmentsApiResponse {
  establishments: Establishment[];
  totalCount: number;
  totalPages: number;
  page: number;
  limit: number;
}

export function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-rotate carousel
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  // Fetch featured establishments
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/establishments?limit=100');
        const data = await parseJsonResponse<EstablishmentsApiResponse | Establishment[]>(res);
        const list = Array.isArray(data) ? data : data.establishments;
        if (Array.isArray(list)) {
          setEstablishments(list.filter((est) => est.isFeatured === true).slice(0, 6));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // Type labels and colors are now imported from @/lib/constants
  // No more duplicate inline definitions

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] lg:min-h-[560px]">
          {/* Left side: Text */}
          <div className="flex flex-col justify-center px-6 py-12 lg:px-16 lg:py-20 bg-gradient-to-br from-primary/5 via-background to-primary/10">
            <div className="max-w-lg">
              <Badge variant="secondary" className="mb-4 text-sm px-3 py-1">
                <Star className="h-3.5 w-3.5 mr-1.5" />
                Sélection exclusive SunuLogis
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
                Trouvez votre{' '}
                <span className="text-primary">chez-vous</span>{' '}
                au Sénégal
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-md">
                Découvrez notre sélection de biens à vendre et à louer. SunuLogis vous aide à préciser votre recherche et à organiser vos visites.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="gap-2" asChild>
                  <Link href="/biens">
                    Explorer le catalogue
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>Biens sélectionnés</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Visites organisées</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Image carousel */}
          <div className="relative h-72 lg:h-auto overflow-hidden">
            {heroImages.map((img, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-1000"
                style={{ opacity: i === currentSlide ? 1 : 0 }}
              >
                <Image
                  src={img}
                  alt={`Sénégal - Image ${i + 1}`}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1023px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
            {/* Carousel indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === currentSlide ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/10 lg:to-background/30" />
          </div>
        </div>
      </section>

      {/* Search CTA */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="max-w-md mx-auto">
            <Link href="/biens" className="block">
            <Card className="cursor-pointer hover:shadow-lg transition-all group border-2 hover:border-primary/50">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Search className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Je cherche un logement</h3>
                  <p className="text-sm text-muted-foreground">Explorez les biens disponibles</p>
                </div>
              </CardContent>
            </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured establishments */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Biens en vedette</h2>
            <p className="text-muted-foreground mt-2">Une sélection suivie directement par SunuLogis</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : establishments.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground/40" />
              <p className="mt-4 text-muted-foreground">Aucun bien disponible pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {establishments.map((est) => (
                <Link key={est.id} href={`/biens/${getPropertySlug(est)}`} className="block">
                <Card className="h-full overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300">
                  <div className="relative h-48 overflow-hidden bg-muted">
                    {est.images && est.images.length > 0 ? (
                      <Image
                        src={est.images[0]}
                        alt={est.name}
                        fill
                        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-primary/10">
                        <Building2 className="h-12 w-12 text-primary/40" />
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3 bg-emerald-700 text-white">
                      {getOperationBadgeLabel(getOperationType(est))}
                    </Badge>
                    <Badge className="absolute top-3 right-3" variant="secondary">
                      <MapPin className="h-3 w-3 mr-1" />
                      {est.city}
                    </Badge>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-lg line-clamp-1">{est.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{est.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-sm font-bold text-primary">{getPriceDisplay(est)}</p>
                        <Badge variant="outline" className={getTypeColor(est.type)}>{getTypeLabel(est.type)}</Badge>
                      </div>
                      <span className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">
                        Voir détails
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">Comment ça marche ?</h2>
            <p className="text-muted-foreground mt-2">Avancez avec une sélection claire et des visites organisées</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <div className="flex items-center justify-center w-8 h-8 mx-auto rounded-full bg-primary text-primary-foreground font-bold text-sm">
                1
              </div>
              <h3 className="text-lg font-semibold">Rechercher</h3>
              <p className="text-sm text-muted-foreground">
                Explorez notre sélection par opération, zone, type de bien et budget
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <div className="flex items-center justify-center w-8 h-8 mx-auto rounded-full bg-primary text-primary-foreground font-bold text-sm">
                2
              </div>
              <h3 className="text-lg font-semibold">Comparer</h3>
              <p className="text-sm text-muted-foreground">
                Comparez les prix, la localisation et les caractéristiques utiles
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10">
                <CalendarCheck className="h-8 w-8 text-primary" />
              </div>
              <div className="flex items-center justify-center w-8 h-8 mx-auto rounded-full bg-primary text-primary-foreground font-bold text-sm">
                3
              </div>
              <h3 className="text-lg font-semibold">Réserver</h3>
              <p className="text-sm text-muted-foreground">
                Demandez une visite ou un dossier, puis échangez directement avec SunuLogis
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold">Recherche personnalisée</h2>
              <p className="mt-2 text-muted-foreground">
                Décrivez votre projet, SunuLogis vous recontacte pour cadrer les critères et proposer les biens pertinents.
              </p>
            </div>
            <Card>
              <CardContent className="p-5 md:p-6">
                <CustomSearchRequestForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
