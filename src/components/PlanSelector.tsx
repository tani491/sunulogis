'use client'

import { Check, X, Zap, Shield, Star, TrendingUp, Headphones, Eye, Image, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VISIBILITY_PACKS, WAVE_INFO } from '@/lib/constants'

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  'Annonce en ligne':                    <Globe className="h-3.5 w-3.5" />,
  "Photos (jusqu'à 8)":                 <Image className="h-3.5 w-3.5" />,
  'Statistiques de vues':               <Eye className="h-3.5 w-3.5" />,
  'Statistiques de clics WhatsApp':     <TrendingUp className="h-3.5 w-3.5" />,
  'Badge "Vérifié"':                    <Shield className="h-3.5 w-3.5" />,
  'Mise en avant (Featured)':           <Star className="h-3.5 w-3.5" />,
  'Priorité dans les résultats':        <Zap className="h-3.5 w-3.5" />,
  'Support prioritaire':                <Headphones className="h-3.5 w-3.5" />,
}

interface PlanSelectorProps {
  onSelectPro?: () => void
  compact?: boolean
}

export function PlanSelector({ onSelectPro, compact = false }: PlanSelectorProps) {
  const [standard, pro] = VISIBILITY_PACKS

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header */}
      {!compact && (
        <div className="text-center space-y-1 pb-1">
          <h2 className="text-xl sm:text-2xl font-bold">Choisissez votre plan</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Paiement via Wave ou Orange Money au{' '}
            <span className="font-semibold text-foreground">{WAVE_INFO.number}</span>
          </p>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

        {/* Standard */}
        <div className="relative rounded-2xl border-2 border-border bg-card flex flex-col gap-4 p-4 sm:p-5">
          {/* Plan label */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              {standard.name}
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">Gratuit</p>
            <p className="text-xs text-muted-foreground mt-0.5">Pour commencer</p>
          </div>

          {/* Features */}
          <ul className="space-y-2 flex-1">
            {standard.features.map((f) => (
              <li key={f.label} className="flex items-start gap-2 text-xs sm:text-sm">
                {f.included ? (
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                ) : (
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground/40">
                    <X className="h-2.5 w-2.5" />
                  </span>
                )}
                <span className={`leading-snug ${f.included ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                  {f.label}
                </span>
              </li>
            ))}
          </ul>

          <Button variant="outline" className="w-full h-9 text-sm" disabled>
            Plan actuel
          </Button>
        </div>

        {/* Pro */}
        <div className="relative rounded-2xl border-2 border-emerald-500 bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 flex flex-col gap-4 p-4 sm:p-5 shadow-lg shadow-emerald-500/10">
          {/* Recommandé badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <Badge className="bg-linear-to-r from-amber-400 to-orange-400 text-white border-0 px-3 py-0.5 text-[11px] font-semibold shadow-sm">
              ✨ Recommandé
            </Badge>
          </div>

          {/* Plan label + price */}
          <div className="pt-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">
              {pro.name}
            </p>
            <div className="flex items-end gap-1 flex-wrap">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-700">
                {pro.price.toLocaleString()}
              </span>
              <span className="text-base font-semibold text-emerald-600 mb-0.5">{pro.currency}</span>
            </div>
            <p className="text-xs text-emerald-600/80 mt-0.5">
              par {pro.period} · Wave / Orange Money
            </p>
          </div>

          {/* Features */}
          <ul className="space-y-2 flex-1">
            {pro.features.map((f) => (
              <li key={f.label} className="flex items-start gap-2 text-xs sm:text-sm">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="h-2.5 w-2.5" />
                </span>
                <span className="text-foreground font-medium leading-snug flex items-center gap-1.5">
                  {FEATURE_ICONS[f.label] && (
                    <span className="text-emerald-500 shrink-0">{FEATURE_ICONS[f.label]}</span>
                  )}
                  {f.label}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="space-y-2">
            <Button
              className="w-full h-10 sm:h-11 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-md shadow-emerald-500/25 font-semibold text-sm sm:text-base gap-2"
              onClick={onSelectPro}
            >
              <Zap className="h-4 w-4 shrink-0" />
              Passer à Sunu Pro
            </Button>
            <p className="text-[11px] sm:text-xs text-center text-emerald-700/70 leading-snug px-1">
              Envoyez{' '}
              <span className="font-semibold text-emerald-700">
                {pro.price.toLocaleString()} FCFA
              </span>{' '}
              via Wave au{' '}
              <span className="font-semibold text-emerald-700">{WAVE_INFO.number}</span>
              , puis déclarez le paiement dans votre annonce.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
