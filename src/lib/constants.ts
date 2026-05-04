// ============================================
// SunuLogis - Shared Constants
// Centralized configuration to avoid duplication
// ============================================

// Commission rates by establishment type (FCFA)
export const COMMISSION_RATES: Record<string, number> = {
  auberge: 1000,
  hotel: 3000,
  appartement: 2500,
  appartement_meuble: 2500,
  lodge: 2500,
  loft: 2500,
  villa: 5000,
  maison_a_vendre: 15000,
}

// Establishment type labels (French)
export const ESTABLISHMENT_TYPES = [
  { value: 'auberge', label: 'Auberge' },
  { value: 'hotel', label: 'Hôtel' },
  { value: 'appartement', label: 'Appartement' },
  { value: 'appartement_meuble', label: 'Appartement Meublé' },
  { value: 'lodge', label: 'Lodge' },
  { value: 'loft', label: 'Loft' },
  { value: 'villa', label: 'Villa' },
  { value: 'maison_a_vendre', label: 'Maison à Vendre' },
] as const

// For filter dropdowns (includes "all" option)
export const ESTABLISHMENT_TYPE_FILTERS = [
  { value: 'all', label: 'Tous les types' },
  ...ESTABLISHMENT_TYPES,
]

// Senegalese regions
export const REGIONS = [
  'Dakar', 'Diourbel', 'Fatick', 'Kaffrine', 'Kaolack',
  'Kédougou', 'Kolda', 'Louga', 'Matam', 'Sédhiou',
  'Saint-Louis', 'Tambacounda', 'Thiès', 'Ziguinchor',
] as const

// Get display label for establishment type
export function getTypeLabel(type: string): string {
  const found = ESTABLISHMENT_TYPES.find(t => t.value === type)
  return found?.label || type
}

// Get Tailwind color classes for establishment type badge
export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    auberge: 'bg-emerald-100 text-emerald-800',
    hotel: 'bg-amber-100 text-amber-800',
    appartement: 'bg-rose-100 text-rose-800',
    appartement_meuble: 'bg-sky-100 text-sky-800',
    lodge: 'bg-orange-100 text-orange-800',
    loft: 'bg-purple-100 text-purple-800',
    villa: 'bg-indigo-100 text-indigo-800',
    maison_a_vendre: 'bg-teal-100 text-teal-800',
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

// Get commission amount for an establishment type
export function getCommissionAmount(type: string): number {
  return COMMISSION_RATES[type] || 1000
}

// Wave payment info
export const WAVE_INFO = {
  number: '778057536',
  name: 'SunuLogis',
}

// Payment statuses
export const PAYMENT_STATUSES = {
  en_attente: 'En attente',
  paye: 'Payé',
} as const

// Role labels (French)
export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  owner: 'Propriétaire',
  client: 'Client',
} as const

// Blog categories
export const BLOG_CATEGORIES = [
  { value: 'all', label: 'Toutes' },
  { value: 'voyage', label: 'Voyage' },
  { value: 'culture', label: 'Culture' },
  { value: 'guide', label: 'Guide' },
  { value: 'actu', label: 'Actualités' },
] as const

// Price range options
export const PRICE_RANGES = [
  { value: 'all', label: 'Tous les prix' },
  { value: '0-10000', label: '0 - 10 000 FCFA' },
  { value: '10000-25000', label: '10 000 - 25 000 FCFA' },
  { value: '25000-50000', label: '25 000 - 50 000 FCFA' },
  { value: '50000-100000', label: '50 000 - 100 000 FCFA' },
  { value: '100000+', label: '100 000+ FCFA' },
] as const

// Freemium visibility packs
export const VISIBILITY_PACKS = [
  {
    id: 'starter',
    name: 'Standard',
    price: 0,
    currency: 'FCFA',
    period: 'mois',
    color: 'gray',
    features: [
      { label: 'Annonce en ligne', included: true },
      { label: 'Photos (jusqu\'à 8)', included: true },
      { label: 'Statistiques de vues', included: true },
      { label: 'Statistiques de clics WhatsApp', included: false },
      { label: 'Badge "Vérifié"', included: false },
      { label: 'Mise en avant (Featured)', included: false },
      { label: 'Priorité dans les résultats', included: false },
      { label: 'Support prioritaire', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Sunu Pro',
    price: 15000,
    currency: 'FCFA',
    period: 'mois',
    color: 'emerald',
    badge: 'Recommandé',
    features: [
      { label: 'Annonce en ligne', included: true },
      { label: 'Photos (jusqu\'à 8)', included: true },
      { label: 'Statistiques de vues', included: true },
      { label: 'Statistiques de clics WhatsApp', included: true },
      { label: 'Badge "Vérifié"', included: true },
      { label: 'Mise en avant (Featured)', included: true },
      { label: 'Priorité dans les résultats', included: true },
      { label: 'Support prioritaire', included: true },
    ],
  },
] as const

export const PRO_FEATURES = [
  'Statistiques de clics WhatsApp',
  'Badge Vérifié',
  'Mise en avant dans les résultats',
  'Priorité de classement',
  'Support prioritaire',
] as const
