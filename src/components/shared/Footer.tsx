'use client'

import { useState } from 'react'
import { Building2, Heart, Mail, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast.error('Veuillez entrer un email valide')
      return
    }

    setSubscribing(true)
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      })
      const data = await res.json()

      if (data.alreadySubscribed) {
        toast.info('Vous êtes déjà inscrit à notre newsletter !')
      } else {
        toast.success('Inscription réussie ! Bienvenue dans la communauté SunuLogis.')
      }
      setEmail('')
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors de l\'inscription')
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold">
                Sunu<span className="text-primary">Logis</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              La plateforme de réservation d&apos;hébergements au Sénégal. Auberges, hôtels, appartements et lodges à travers les 14 régions.
            </p>
          </div>

          {/* Liens */}
          <div className="space-y-3">
            <h4 className="font-semibold">Liens utiles</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Accueil</li>
              <li>Établissements</li>
              <li>Blog</li>
              <li>Devenir propriétaire</li>
              <li>Conditions d&apos;utilisation</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Dakar, Sénégal</li>
              <li>contact@sunulogis.sn</li>
              <li>+221 77 361 59 44</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Newsletter
            </h4>
            <p className="text-sm text-muted-foreground">
              Recevez nos offres exclusives et bons plans hébergement au Sénégal.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="votre@email.sn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-sm"
                  disabled={subscribing}
                  required
                />
                <Button type="submit" size="sm" disabled={subscribing} className="gap-1.5 shrink-0">
                  {subscribing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="h-3.5 w-3.5" />
                  )}
                  OK
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                En vous inscrivant, vous acceptez de recevoir nos communications.
              </p>
            </form>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground flex items-center justify-center gap-1">
          Fait avec <Heart className="h-3 w-3 text-red-500 fill-red-500" /> au Sénégal &copy; {new Date().getFullYear()} SunuLogis
        </div>
      </div>
    </footer>
  )
}
