'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, ArrowRight, Building2, Banknote, SlidersHorizontal, ChevronLeft, ChevronRight, BedDouble } from 'lucide-react'
import { DAKAR_NEIGHBORHOODS, ESTABLISHMENT_TYPE_FILTERS, OPERATION_FILTERS, REGIONS, PRICE_RANGES, getTypeLabel, getTypeColor } from '@/lib/constants'
import { parseJsonResponse } from '@/lib/fetch-json'
import { getOperationBadgeLabel, getOperationType, getPriceDisplay, getPropertySlug } from '@/lib/real-estate'

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
  reference?: string | null
  slug?: string | null
  operationType?: string | null
  priceAmount?: number | null
  pricePeriod?: string | null
  priceStatus?: string | null
  bedrooms?: number | null
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
  const { searchFilters, setSearchFilters } = useAppStore()
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [operationFilter, setOperationFilter] = useState<string>('all')
  const [bedroomFilter, setBedroomFilter] = useState<string>('all')
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
    operationFilter,
    bedroomFilter,
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
      if (operationFilter && operationFilter !== 'all') params.set('operationType', operationFilter)
      if (bedroomFilter && bedroomFilter !== 'all') params.set('bedrooms', bedroomFilter)
      params.set('page', String(currentPage))
      params.set('limit', String(PAGE_LIMIT))

      // Price filter ranges
      const pr = searchFilters.priceRange
      if (pr && pr !== 'all') {
        if (pr.endsWith('+')) {
          params.set('minPrice', pr.replace('+', ''))
        } else {
          const [min, max] = pr.split('-')
          if (min && min !== '0') params.set('minPrice', min)
          if (max) params.set('maxPrice', max)
        }
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

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value)
    setCurrentPage(1)
  }

  const handleOperationFilterChange = (value: string) => {
    setOperationFilter(value)
    setCurrentPage(1)
  }

  const handleBedroomFilterChange = (value: string) => {
    setBedroomFilter(value)
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
        <Select value={operationFilter} onValueChange={handleOperationFilterChange}>
          <SelectTrigger className="w-full sm:w-44 h-9">
            <Banknote className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Acheter / louer" />
          </SelectTrigger>
          <SelectContent>
            {OPERATION_FILTERS.map((operation) => (
              <SelectItem key={operation.value} value={operation.value}>{operation.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <Select value={bedroomFilter} onValueChange={handleBedroomFilterChange}>
          <SelectTrigger className="w-full sm:w-44 h-9">
            <BedDouble className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Chambres" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes chambres</SelectItem>
            <SelectItem value="1">1+ chambre</SelectItem>
            <SelectItem value="2">2+ chambres</SelectItem>
            <SelectItem value="3">3+ chambres</SelectItem>
            <SelectItem value="4">4+ chambres</SelectItem>
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
          <h2 className="text-2xl font-bold">Biens disponibles</h2>
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
            <h3 className="text-lg font-semibold text-muted-foreground">Aucun bien trouvé</h3>
            <p className="text-sm text-muted-foreground">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEstablishments.map((est, index) => (
              <Link key={est.id} href={`/biens/${getPropertySlug(est)}`} className="block">
              <Card className="h-full overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300">
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
                  <Badge className="absolute top-3 left-3 bg-emerald-700 text-white">
                    {getOperationBadgeLabel(getOperationType(est))}
                  </Badge>
                  <Badge className="absolute top-3 right-3" variant="secondary">
                    <MapPin className="h-3 w-3 mr-1" />
                    {est.city}
                  </Badge>
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
                      <p className="text-sm font-bold text-primary">{getPriceDisplay(est)}</p>
                      <Badge variant="outline" className={getTypeColor(est.type)}>{getTypeLabel(est.type)}</Badge>
                    </div>
                    <span className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">
                      Voir détails
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                  {est.bedrooms ? (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <BedDouble className="h-3 w-3" />
                      {est.bedrooms} chambre{est.bedrooms !== 1 ? 's' : ''}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
              </Link>
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
