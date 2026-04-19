'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, MapPin, Users, ArrowRight, Building2, Globe, Banknote, SlidersHorizontal } from 'lucide-react'

const establishmentTypes = [
  { value: 'all', label: 'Tous les types' },
  { value: 'auberge', label: 'Auberge' },
  { value: 'hotel', label: 'Hôtel' },
  { value: 'appartement', label: 'Appartement' },
  { value: 'appartement_meuble', label: 'Appartement Meublé' },
  { value: 'lodge', label: 'Lodge' },
  { value: 'loft', label: 'Loft' },
]

const regions = [
  'Dakar', 'Diourbel', 'Fatick', 'Kaffrine', 'Kaolack',
  'Kédougou', 'Kolda', 'Louga', 'Matam', 'Sédhiou',
  'Saint-Louis', 'Tambacounda', 'Thiès', 'Ziguinchor',
]

interface Establishment {
  id: string
  name: string
  type: string
  description: string
  city: string
  region: string
  images: string[]
  phone?: string
  website?: string
  minPrice: number | null
  rooms: { id: string; name: string; pricePerNight: number; capacity: number; isAvailable: boolean }[]
}

export function HomePage() {
  const { navigate, selectEstablishment, searchFilters, setSearchFilters } = useAppStore()
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    fetchEstablishments()
  }, [searchFilters.region, searchFilters.priceRange, typeFilter])

  const fetchEstablishments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchFilters.region && searchFilters.region !== 'all') params.set('region', searchFilters.region)
      if (searchFilters.search) params.set('search', searchFilters.search)
      if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter)

      // Price filter ranges
      const pr = searchFilters.priceRange
      if (pr === '0-10000') {
        params.set('maxPrice', '10000')
      } else if (pr === '10000-25000') {
        params.set('minPrice', '10000')
        params.set('maxPrice', '25000')
      } else if (pr === '25000-50000') {
        params.set('minPrice', '25000')
        params.set('maxPrice', '50000')
      } else if (pr === '50000-100000') {
        params.set('minPrice', '50000')
        params.set('maxPrice', '100000')
      } else if (pr === '100000+') {
        params.set('minPrice', '100000')
      }

      const url = params.toString() ? `/api/establishments?${params.toString()}` : '/api/establishments'
      const res = await fetch(url)
      const data = await res.json()
      setEstablishments(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredEstablishments = establishments.filter((e) =>
    !searchFilters.search || e.name.toLowerCase().includes(searchFilters.search.toLowerCase()) || e.city.toLowerCase().includes(searchFilters.search.toLowerCase())
  )

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      auberge: 'Auberge',
      hotel: 'Hôtel',
      appartement: 'Appartement',
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
      appartement: 'bg-rose-100 text-rose-800',
      appartement_meuble: 'bg-sky-100 text-sky-800',
      lodge: 'bg-orange-100 text-orange-800',
      loft: 'bg-purple-100 text-purple-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const handleViewDetail = (id: string) => {
    selectEstablishment(id)
  }

  return (
    <div className="space-y-8">
      {/* Filters bar */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtres :</span>
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48 h-9">
            <Building2 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {establishmentTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={searchFilters.region} onValueChange={(v) => setSearchFilters({ region: v })}>
          <SelectTrigger className="w-full sm:w-44 h-9">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Région" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les régions</SelectItem>
            {regions.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={searchFilters.priceRange} onValueChange={(v) => setSearchFilters({ priceRange: v })}>
          <SelectTrigger className="w-full sm:w-48 h-9">
            <Banknote className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Budget" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les prix</SelectItem>
            <SelectItem value="0-10000">0 - 10 000 FCFA</SelectItem>
            <SelectItem value="10000-25000">10 000 - 25 000 FCFA</SelectItem>
            <SelectItem value="25000-50000">25 000 - 50 000 FCFA</SelectItem>
            <SelectItem value="50000-100000">50 000 - 100 000 FCFA</SelectItem>
            <SelectItem value="100000+">100 000+ FCFA</SelectItem>
          </SelectContent>
        </Select>
      </section>

      {/* Establishment Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Établissements disponibles</h2>
          <Badge variant="outline">{filteredEstablishments.length} résultat{filteredEstablishments.length !== 1 ? 's' : ''}</Badge>
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
        ) : filteredEstablishments.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground/40" />
            <h3 className="text-lg font-semibold text-muted-foreground">Aucun établissement trouvé</h3>
            <p className="text-sm text-muted-foreground">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEstablishments.map((est) => (
              <Card
                key={est.id}
                className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => handleViewDetail(est.id)}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-muted">
                  {est.images && est.images.length > 0 ? (
                    <img
                      src={est.images[0]}
                      alt={est.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-primary/10">
                      <Building2 className="h-12 w-12 text-primary/40" />
                    </div>
                  )}
                  <Badge className={`absolute top-3 left-3 ${getTypeColor(est.type)}`}>
                    {getTypeLabel(est.type)}
                  </Badge>
                  <Badge className="absolute top-3 right-3" variant="secondary">
                    <MapPin className="h-3 w-3 mr-1" />
                    {est.city}
                  </Badge>
                  {est.website && (
                    <Badge className="absolute bottom-3 right-3 bg-white/90 text-foreground hover:bg-white" variant="secondary">
                      <Globe className="h-3 w-3 mr-1" />
                      Site web
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{est.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{est.description}</p>
                  {est.region && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {est.city}, {est.region}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      {est.minPrice !== null && est.minPrice !== undefined ? (
                        <p className="text-sm">
                          <span className="font-bold text-primary">{est.minPrice.toLocaleString()} FCFA</span>
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
                  {est.rooms.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {est.rooms.filter((r) => r.isAvailable).length} chambre{est.rooms.filter((r) => r.isAvailable).length !== 1 ? 's' : ''} disponible{est.rooms.filter((r) => r.isAvailable).length !== 1 ? 's' : ''}
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
