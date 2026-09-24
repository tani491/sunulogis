export type OperationType = 'VENTE' | 'LOCATION_MENSUELLE' | 'SEJOUR_NUITEE'
export type PricePeriod = 'MOIS' | 'NUITEE' | 'NONE'
export type PriceStatus = 'KNOWN' | 'SUR_DEMANDE'

import { SUNULOGIS_CONTACT } from './constants'

export interface PropertyPriceSource {
  id: string
  name: string
  type?: string | null
  reference?: string | null
  slug?: string | null
  operationType?: OperationType | string | null
  priceAmount?: number | null
  pricePeriod?: PricePeriod | string | null
  priceStatus?: PriceStatus | string | null
  minPrice?: number | null
  description?: string | null
}

const TERANGA_NAME = 'teranga park villas'
const CONFORT_PLUS_NAME = 'confort+'

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function normalizedName(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function getPropertyReference(property: Pick<PropertyPriceSource, 'id' | 'reference'>) {
  if (property.reference?.trim()) return property.reference.trim()
  const suffix = property.id ? property.id.slice(-6).toUpperCase() : '000001'
  return `SL-${suffix}`
}

export function getPropertySlug(property: Pick<PropertyPriceSource, 'id' | 'name' | 'slug'>) {
  if (property.slug?.trim()) return property.slug.trim()
  const base = slugify(property.name || 'bien-sunulogis') || 'bien-sunulogis'
  return `${base}-${property.id}`
}

export function extractIdFromPropertySlug(slug: string) {
  const parts = slug.split('-')
  return parts.length > 1 ? parts[parts.length - 1] : slug
}

export function getOperationType(property: PropertyPriceSource): OperationType {
  const name = normalizedName(property.name || '')
  if (name.includes(TERANGA_NAME)) return 'VENTE'
  if (property.operationType === 'VENTE' || property.type === 'maison_a_vendre') return 'VENTE'
  if (property.operationType === 'LOCATION_MENSUELLE' || property.pricePeriod === 'MOIS') return 'LOCATION_MENSUELLE'
  return 'SEJOUR_NUITEE'
}

export function getPropertyOverrides(property: PropertyPriceSource) {
  const name = normalizedName(property.name || '')

  if (name.includes(TERANGA_NAME)) {
    return {
      operationType: 'VENTE' as OperationType,
      priceAmount: 157_200_000,
      pricePeriod: 'NONE' as PricePeriod,
      priceStatus: 'KNOWN' as PriceStatus,
    }
  }

  if (name.includes(CONFORT_PLUS_NAME)) {
    return {
      priceAmount: null,
      priceStatus: 'SUR_DEMANDE' as PriceStatus,
    }
  }

  return null
}

function safePositivePrice(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null
  if (value > 10_000_000_000) return null
  return value
}

export function resolvePropertyPrice(property: PropertyPriceSource) {
  const overrides = getPropertyOverrides(property)
  const operationType = overrides?.operationType ?? getOperationType(property)
  const priceStatus = overrides?.priceStatus ?? property.priceStatus ?? 'KNOWN'
  const explicitPrice = overrides ? overrides.priceAmount : property.priceAmount
  const fallbackPrice = operationType === 'VENTE' ? null : property.minPrice
  const amount = priceStatus === 'SUR_DEMANDE'
    ? null
    : safePositivePrice(explicitPrice) ?? safePositivePrice(fallbackPrice)

  const pricePeriod = overrides?.pricePeriod ?? property.pricePeriod ?? (
    operationType === 'LOCATION_MENSUELLE' ? 'MOIS' : operationType === 'SEJOUR_NUITEE' ? 'NUITEE' : 'NONE'
  )

  return {
    operationType,
    amount,
    pricePeriod: pricePeriod as PricePeriod,
    priceStatus: amount ? 'KNOWN' as PriceStatus : 'SUR_DEMANDE' as PriceStatus,
  }
}

export function formatCfa(value: number) {
  return `${new Intl.NumberFormat('fr-FR').format(value)} FCFA`
}

export function getOperationBadgeLabel(operationType: OperationType) {
  if (operationType === 'VENTE') return 'À vendre'
  if (operationType === 'LOCATION_MENSUELLE') return 'À louer'
  return 'Séjour'
}

export function getPriceDisplay(property: PropertyPriceSource) {
  const price = resolvePropertyPrice(property)
  if (!price.amount) return 'Prix sur demande'

  if (price.operationType === 'VENTE') return formatCfa(price.amount)
  if (price.operationType === 'LOCATION_MENSUELLE') return `${formatCfa(price.amount)} / mois`
  return `${formatCfa(price.amount)} / nuit`
}

export function getPropertyLocation(property: { address?: string | null; city?: string | null; region?: string | null }) {
  return [property.address, property.city].filter(Boolean).join(', ') || property.region || 'Sénégal'
}

export function getWhatsAppPropertyLink(options: {
  reference: string
  title: string
  location: string
  intent?: 'visit' | 'file' | 'contact'
}) {
  const intentLabel = options.intent === 'file'
    ? 'recevoir le dossier'
    : options.intent === 'visit'
      ? 'organiser une visite'
      : 'avoir plus d’informations'
  const message = `Bonjour SunuLogis, je souhaite ${intentLabel} pour le bien ${options.reference} - ${options.title}, situé à ${options.location}.`
  return `https://wa.me/${SUNULOGIS_CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`
}

