'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, MapPin, Users, ArrowRight, Building2, Globe, Banknote } from 'lucide-react'

interface Hostel {
  id: string
  name: string
  description: string
  city: string
  address: string
  images: string[]
  phone?: string
  website?: string
  minPrice: number | null
  rooms: { id: string; name: string; pricePerNight: number; capacity: number; isAvailable: boolean }[]
}

export function HomePage() {
  const { navigate, selectHostel } = useAppStore()
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [loading, setLoading] = useState(true)
  const [cityFilter, setCityFilter] = useState<string>('all')
  const [priceFilter, setPriceFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchHostels()
  }, [cityFilter, priceFilter])

  const fetchHostels = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (cityFilter && cityFilter !== 'all') params.set('city', cityFilter)

      // Price filter ranges
      if (priceFilter === '0-15000') {
        params.set('maxPrice', '15000')
      } else if (priceFilter === '15000-30000') {
        params.set('minPrice', '15000')
        params.set('maxPrice', '30000')
      } else if (priceFilter === '30000-50000') {
        params.set('minPrice', '30000')
        params.set('maxPrice', '50000')
      } else if (priceFilter === '50000+') {
        params.set('minPrice', '50000')
      }

      const url = params.toString() ? `/api/hostels?${params.toString()}` : '/api/hostels'
      const res = await fetch(url)
      const data = await res.json()
      setHostels(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredHostels = hostels.filter((h) =>
    !searchQuery || h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const cities = ['Dakar', 'Saint-Louis', 'Saly', 'Thies', 'Ziguinchor', 'Kaolack']

  const handleViewDetail = (id: string) => {
    selectHostel(id)
    navigate('hostel-detail')
  }

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/30 p-8 md:p-16">
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="mb-2 text-sm px-3 py-1">Sénégal</Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Trouvez votre auberge idéale au <span className="text-primary">Sénégal</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez les meilleures auberges et maisons d&apos;hôtes à travers le Sénégal.
            Réservez en quelques clics et confirmez via WhatsApp.
          </p>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mt-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une auberge..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les villes</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Banknote className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les prix</SelectItem>
                <SelectItem value="0-15000">Moins de 15 000 FCFA</SelectItem>
                <SelectItem value="15000-30000">15 000 - 30 000 FCFA</SelectItem>
                <SelectItem value="30000-50000">30 000 - 50 000 FCFA</SelectItem>
                <SelectItem value="50000+">Plus de 50 000 FCFA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-primary/5 blur-2xl" />
      </section>

      {/* Hostel Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Auberges disponibles</h2>
          <Badge variant="outline">{filteredHostels.length} résultat{filteredHostels.length !== 1 ? 's' : ''}</Badge>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredHostels.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground/40" />
            <h3 className="text-lg font-semibold text-muted-foreground">Aucune auberge trouvée</h3>
            <p className="text-sm text-muted-foreground">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHostels.map((hostel) => (
              <Card
                key={hostel.id}
                className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => handleViewDetail(hostel.id)}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-muted">
                  {hostel.images && hostel.images.length > 0 ? (
                    <img
                      src={hostel.images[0]}
                      alt={hostel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-primary/10">
                      <Building2 className="h-12 w-12 text-primary/40" />
                    </div>
                  )}
                  <Badge className="absolute top-3 left-3" variant="secondary">
                    <MapPin className="h-3 w-3 mr-1" />
                    {hostel.city}
                  </Badge>
                  {hostel.website && (
                    <Badge className="absolute top-3 right-3 bg-white/90 text-foreground hover:bg-white" variant="secondary">
                      <Globe className="h-3 w-3 mr-1" />
                      Site web
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-lg line-clamp-1">{hostel.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{hostel.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      {hostel.minPrice !== null && hostel.minPrice !== undefined ? (
                        <p className="text-sm">
                          <span className="font-bold text-primary">{hostel.minPrice.toLocaleString()} FCFA</span>
                          <span className="text-muted-foreground"> / nuit</span>
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Prix non disponible</p>
                      )}
                    </div>
                    <Button size="sm" className="gap-1">
                      Voir détails
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                  {hostel.rooms.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {hostel.rooms.filter((r) => r.isAvailable).length} chambre{hostel.rooms.filter((r) => r.isAvailable).length !== 1 ? 's' : ''} disponible{hostel.rooms.filter((r) => r.isAvailable).length !== 1 ? 's' : ''}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
