'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Users, ArrowRight, Building2, Globe, Banknote, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { DAKAR_NEIGHBORHOODS, ESTABLISHMENT_TYPE_FILTERS, REGIONS, PRICE_RANGES, getTypeLabel, getTypeColor } from '@/lib/constants'
import { parseJsonResponse } from '@/lib/fetch-json'

const PAGE_LIMIT = 9

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

interface EstablishmentsApiResponse {
  establishments: Establishment[]
  totalCount: number
  totalPages: number
  page: number
  limit: number
}

export function HomePage() {
  const { navigate, selectEstablishment, searchFilters, setSearchFilters } = useAppStore()
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const latestRequestId = useRef(0)
  const latestFilterKey = useRef('')
  const filterKey = [
    searchFilters.region,
    searchFilters.neighborhood,
    searchFilters.priceRange,
    searchFilters.search,
    typeFilter,
  ].join('|')

  async function fetchEstablishments() {
    const requestId = latestRequestId.current + 1
    latestRequestId.current = requestId
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchFilters.region && searchFilters.region !== 'all') params.set('region', searchFilters.region)
      if (searchFilters.region === 'Dakar' && searchFilters.neighborhood && searchFilters.neighborhood !== 'all') {
        params.set('neighborhood', searchFilters.neighborhood)
      }
      if (searchFilters.search) params.set('search', searchFilters.search)
      if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter)
      params.set('page', String(currentPage))
      params.set('limit', String(PAGE_LIMIT))

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
      const data = await parseJsonResponse<EstablishmentsApiResponse | Establishment[]>(res)
      if (latestRequestId.current !== requestId) return

      if (Array.isArray(data)) {
        setEstablishments(data)
        setTotalCount(data.length)
        setTotalPages(data.length > 0 ? 1 : 0)
      } else {
        setEstablishments(Array.isArray(data.establishments) ? data.establishments : [])
        setTotalCount(Number.isFinite(data.totalCount) ? data.totalCount : 0)
        setTotalPages(Number.isFinite(data.totalPages) ? data.totalPages : 0)
      }
    } catch (err) {
      console.error(err)
    } finally {
      if (latestRequestId.current === requestId) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const filtersChanged = latestFilterKey.current !== filterKey
      latestFilterKey.current = filterKey
      if (filtersChanged && currentPage !== 1) {
        setCurrentPage(1)
        return
      }

      void fetchEstablishments()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [filterKey, currentPage])

  const filteredEstablishments = establishments
  const displayTotalPages = Math.max(totalPages, 1)

  const handleViewDetail = (id: string) => {
    selectEstablishment(id)
  }

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value)
    setCurrentPage(1)
  }

  const handleRegionFilterChange = (value: string) => {
    setSearchFilters({ region: value, neighborhood: 'all' })
    setCurrentPage(1)
  }

  const handleNeighborhoodFilterChange = (value: string) => {
    setSearchFilters({ neighborhood: value })
    setCurrentPage(1)
  }

  const handlePriceFilterChange = (value: string) => {
    setSearchFilters({ priceRange: value })
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 350, behavior: 'smooth' })
  }

  return (
    <div className="space-y-8">
      {/* Filters bar */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtres :</span>
        </div>
        <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
          <SelectTrigger className="w-full sm:w-48 h-9">
            <Building2 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {ESTABLISHMENT_TYPE_FILTERS.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={searchFilters.region} onValueChange={handleRegionFilterChange}>
          <SelectTrigger className="w-full sm:w-44 h-9">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Région" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les régions</SelectItem>
            {REGIONS.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={searchFilters.priceRange} onValueChange={handlePriceFilterChange}>
          <SelectTrigger className="w-full sm:w-48 h-9">
            <Banknote className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Budget" />
          </SelectTrigger>
          <SelectContent>
            {PRICE_RANGES.map((p) => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {searchFilters.region === 'Dakar' && (
          <Select value={searchFilters.neighborhood} onValueChange={handleNeighborhoodFilterChange}>
            <SelectTrigger className="w-full sm:w-52 h-9">
              <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Quartier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les quartiers</SelectItem>
              {DAKAR_NEIGHBORHOODS.map((neighborhood) => (
                <SelectItem key={neighborhood} value={neighborhood}>{neighborhood}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </section>

      {/* Establishment Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Établissements disponibles</h2>
          <Badge variant="outline">{totalCount} résultat{totalCount !== 1 ? 's' : ''}</Badge>
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
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEstablishments.map((est, index) => (
              <Card
                key={est.id}
                className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => handleViewDetail(est.id)}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-muted">
                  {est.images && est.images.length > 0 ? (
                    <Image
                      src={est.images[0]}
                      alt={est.name}
                      fill
                      priority={index < 3}
                      sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
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
                      {est.type === 'maison_a_vendre' ? (
                        <p className="text-sm">
                          <span className="font-bold text-primary">À vendre</span>
                        </p>
                      ) : est.minPrice !== null && est.minPrice !== undefined ? (
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

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                  Page {currentPage} sur {displayTotalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => handlePageChange(Math.min(displayTotalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
