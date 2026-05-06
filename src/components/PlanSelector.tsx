'use client'

import { useState } from 'react'
import { Check, X, Zap, Shield, Star, TrendingUp, Headphones, Eye, Image, Globe, Megaphone, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { VISIBILITY_PACKS, WAVE_INFO, WAVE_PAY_LINK } from '@/lib/constants'

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  'Annonce en ligne':                    <Globe className="h-3.5 w-3.5" />,
  "Photos (jusqu'à 8)":                 <Image className="h-3.5 w-3.5" />,
  'Statistiques de vues':               <Eye className="h-3.5 w-3.5" />,
  'Statistiques de clics WhatsApp':     <TrendingUp className="h-3.5 w-3.5" />,
  'Badge "Vérifié"':                    <Shield className="h-3.5 w-3.5" />,
  'Mise en avant (Featured)':           <Star className="h-3.5 w-3.5" />,
  'Priorité dans les résultats':        <Zap className="h-3.5 w-3.5" />,
  'Support prioritaire':                <Headphones className="h-3.5 w-3.5" />,
  'Création de contenu pour vous + diffusion sur nos réseaux sociaux pour attirer des clients': <Megaphone className="h-3.5 w-3.5" />,
}

interface PlanSelectorProps {
  onSelectPro?: () => void
  compact?: boolean
}

export function PlanSelector({ onSelectPro, compact = false }: PlanSelectorProps) {
  const [standard, pro] = VISIBILITY_PACKS
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handlePayWave = () => {
    window.location.href = WAVE_PAY_LINK
  }

  const handleDeclare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!details.trim()) {
      toast.error('Entrez votre numéro ou ID de transaction')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/subscription-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionDetails: details.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur')
        return
      }
      setSubmitted(true)
      setDetails('')
      toast.success('Demande envoyée. Un admin va valider votre paiement.')
      onSelectPro?.()
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {!compact && (
        <div className="text-center space-y-1 pb-1">
          <h2 className="text-xl sm:text-2xl font-bold">Choisissez votre plan</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Paiement direct via Wave — 15 000 FCFA / mois
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

        {/* Standard */}
        <div className="relative rounded-2xl border-2 border-border bg-card flex flex-col gap-4 p-4 sm:p-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              {standard.name}
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">Gratuit</p>
            <p className="text-xs text-muted-foreground mt-0.5">Pour commencer</p>
          </div>

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
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <Badge className="bg-linear-to-r from-amber-400 to-orange-400 text-white border-0 px-3 py-0.5 text-[11px] font-semibold shadow-sm">
              ✨ Recommandé
            </Badge>
          </div>

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
              par {pro.period} · paiement Wave instantané
            </p>
          </div>

          <ul className="space-y-2 flex-1">
            {pro.features.map((f) => (
              <li key={f.label} className="flex items-start gap-2 text-xs sm:text-sm">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="h-2.5 w-2.5" />
                </span>
                <span className="text-foreground font-medium leading-snug flex items-start gap-1.5">
                  {FEATURE_ICONS[f.label] && (
                    <span className="text-emerald-500 shrink-0 mt-0.5">{FEATURE_ICONS[f.label]}</span>
                  )}
                  <span>{f.label}</span>
                </span>
              </li>
            ))}
          </ul>

          {/* CTA Wave direct */}
          <div className="space-y-3">
            <Button
              type="button"
              className="w-full h-10 sm:h-11 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-md shadow-emerald-500/25 font-semibold text-sm sm:text-base gap-2"
              onClick={handlePayWave}
            >
              <Zap className="h-4 w-4 shrink-0" />
              Passer à Sunu Pro
            </Button>
            <p className="text-[11px] sm:text-xs text-center text-emerald-700/70 leading-snug px-1">
              Vous serez redirigé vers Wave. Validez sur votre téléphone, puis revenez ici.
            </p>

            {/* Form: déclarer un paiement déjà effectué */}
            <div className="border-t border-emerald-200/60 pt-3 mt-1">
              {submitted ? (
                <div className="flex items-start gap-2 rounded-lg bg-emerald-100/70 px-3 py-2 text-xs text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Demande envoyée. Notre équipe valide sous 24h.</span>
                </div>
              ) : (
                <form onSubmit={handleDeclare} className="space-y-2">
                  <label className="text-[11px] font-medium text-emerald-800">
                    Déjà payé ? Entrez votre numéro de téléphone ou ID de transaction
                  </label>
                  <Input
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder={`Ex : 77 123 45 67 ou TXN-${WAVE_INFO.number}`}
                    className="h-9 text-sm bg-white"
                    disabled={submitting}
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full h-9 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    disabled={submitting}
                  >
                    {submitting ? 'Envoi…' : 'Déclarer mon paiement'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
