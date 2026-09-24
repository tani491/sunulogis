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
  studio: 2500,
  lodge: 2500,
  loft: 2500,
  villa: 5000,
  maison_a_vendre: 15000,
}

// Establishment type labels (French)
export const ESTABLISHMENT_TYPES = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'appartement_meuble', label: 'Appartement Meublé' },
  { value: 'studio', label: 'Studio' },
  { value: 'villa', label: 'Villa' },
  { value: 'maison_a_vendre', label: 'Maison' },
  { value: 'terrain', label: 'Terrain' },
  { value: 'bureau', label: 'Bureau' },
  { value: 'local_commercial', label: 'Local commercial' },
  { value: 'auberge', label: 'Auberge' },
  { value: 'hotel', label: 'Hôtel' },
  { value: 'lodge', label: 'Lodge' },
  { value: 'loft', label: 'Loft' },
] as const

// For filter dropdowns (includes "all" option)
export const ESTABLISHMENT_TYPE_FILTERS = [
  { value: 'all', label: 'Tous les biens' },
  ...ESTABLISHMENT_TYPES,
]

export const OPERATION_FILTERS = [
  { value: 'all', label: 'Acheter / louer' },
  { value: 'VENTE', label: 'Acheter' },
  { value: 'LOCATION_MENSUELLE', label: 'Louer' },
  { value: 'SEJOUR_NUITEE', label: 'Séjour' },
] as const

// Senegalese regions
export const REGIONS = [
  'Dakar', 'Diourbel', 'Fatick', 'Kaffrine', 'Kaolack',
  'Kédougou', 'Kolda', 'Louga', 'Matam', 'Sédhiou',
  'Saint-Louis', 'Tambacounda', 'Thiès', 'Ziguinchor',
] as const

// Dakar neighborhoods
export const DAKAR_NEIGHBORHOODS = [
  'Almadies', 'Ben Tally', 'Camberène', 'Castors', 'Centre-ville / Plateau',
  'Cité Keur Gorgui', 'Dakar Plateau', 'Dany', 'Dieuppeul', 'Fann Résidence',
  'Grand Dakar', 'Grand Yoff', 'Guediawaye', 'Hann Maristes', 'HLM',
  'Kapo', 'Keur Massar', 'Liberte 1', 'Liberte 2', 'Liberte 3', 'Liberte 4',
  'Liberte 5', 'Liberte 6', 'Malika', 'Mermoz', 'Medina', 'Ngor',
  'Nord Foire', 'Ouakam', 'Parcelles Assainies', 'Pikine', 'Point E',
  'Rufisque', 'Sacré-Cœur 1', 'Sacré-Cœur 2', 'Sacré-Cœur 3', 'Sicotap',
  'Thiaroye', 'Yoff', 'Zac Mbao',
]

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
    studio: 'bg-cyan-100 text-cyan-800',
    lodge: 'bg-orange-100 text-orange-800',
    loft: 'bg-purple-100 text-purple-800',
    villa: 'bg-indigo-100 text-indigo-800',
    maison_a_vendre: 'bg-teal-100 text-teal-800',
    terrain: 'bg-lime-100 text-lime-800',
    bureau: 'bg-slate-100 text-slate-800',
    local_commercial: 'bg-fuchsia-100 text-fuchsia-800',
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

// Get commission amount for an establishment type
export function getCommissionAmount(type: string): number {
  return COMMISSION_RATES[type] || 1000
}

// Wave payment info — Wave Business (773615944)
export const WAVE_INFO = {
  number: '773615944',
  name: 'SunuLogis',
}

// Contact officiel SunuLogis pour la mise en relation des leads
export const SUNULOGIS_CONTACT = {
  whatsappNumber: '221778057536',
  phoneHref: '+221778057536',
  phoneDisplay: '+221 77 805 75 36',
}

// Lien marchand Wave Business pour l'abonnement Sunu Pro (15 000 FCFA)
export const WAVE_PAY_LINK = 'https://pay.wave.com/m/M_sn_sOEITXNn4hV_/c/sn/'

// Prix abonnement Sunu Pro mensuel
export const PRO_PRICE = 15000

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
  { value: 'all', label: 'Tous les budgets' },
  { value: '0-150000', label: 'Jusqu’à 150 000 FCFA' },
  { value: '150000-500000', label: '150 000 - 500 000 FCFA' },
  { value: '500000-1000000', label: '500 000 - 1 000 000 FCFA' },
  { value: '1000000-50000000', label: '1 M - 50 M FCFA' },
  { value: '50000000-150000000', label: '50 M - 150 M FCFA' },
  { value: '150000000+', label: '150 M+ FCFA' },
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
      { label: 'Création de contenu pour vous tout en postant vos biens dans nos réseaux sociaux', included: true },
    ],
  },
] as const

export const PRO_FEATURES = [
  'Statistiques de clics WhatsApp',
  'Badge Vérifié',
  'Mise en avant dans les résultats',
  'Priorité de classement',
  'Support prioritaire',
  'Création de contenu + diffusion réseaux sociaux',
] as const
