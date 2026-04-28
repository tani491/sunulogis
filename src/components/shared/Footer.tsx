'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Heart, Mail, Loader2, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { parseJsonResponse } from '@/lib/fetch-json'

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073C24 5.41 18.627 0 12 0S0 5.41 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
    </svg>
  )
}

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/SunuLogis',
    icon: FacebookIcon,
    hoverClass: 'hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/sunulogis/',
    icon: InstagramIcon,
    hoverClass: 'hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] hover:text-white hover:border-transparent',
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/@sunulogis8',
    icon: TikTokIcon,
    hoverClass: 'hover:bg-black hover:text-white hover:border-black',
  },
]

export default function Footer() {
  const { navigate } = useAppStore()
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
      const data = await parseJsonResponse<{ alreadySubscribed?: boolean }>(res)

      if (data.alreadySubscribed) {
        toast.info('Vous etes deja inscrit a notre newsletter !')
      } else {
        toast.success('Inscription reussie ! Bienvenue dans la communaute SunuLogis.')
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
    <footer className="border-t border-green-500/30 bg-card mt-auto">
      <div className="container mx-auto px-4 pt-10 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">

          {/* Brand + reseaux sociaux */}
          <div className="space-y-4 md:col-span-1">
            <Image
              src="/sunulogis-logo.jpeg"
              alt="SunuLogis"
              width={220}
              height={88}
              sizes="160px"
              className="h-[52px] w-auto object-contain"
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
              La plateforme de reservation d&apos;hebergements au Senegal — auberges, hotels, appartements, villas et lodges dans les 14 regions.
            </p>

            {/* Reseaux sociaux */}
            <div className="flex items-center gap-5 py-2">
              {/* Facebook - Bleu Officiel */}
              <a 
                href="https://www.facebook.com/SunuLogis" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110" 
                aria-label="Suivez SunuLogis sur Facebook"
              >
                <FacebookIcon className="h-6 w-6 text-[#1877F2]" /> 
              </a>

              {/* Instagram - Rose/Rouge Officiel */}
              <a 
                href="https://www.instagram.com/sunulogis/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110" 
                aria-label="Suivez SunuLogis sur Instagram"
              >
                <InstagramIcon className="h-6 w-6 text-[#E4405F]" />
              </a>

              {/* TikTok - Noir Officiel */}
              <a 
                href="https://tiktok.com/@sunulogis8" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110" 
                aria-label="Suivez SunuLogis sur TikTok"
              >
                <TikTokIcon className="h-6 w-6 text-black" />
              </a>
            </div>
          </div>

          {/* Liens utiles */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm tracking-wide uppercase text-foreground/60">Navigation</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Accueil', view: 'home' as const },
                { label: 'Etablissements', view: 'home' as const },
                { label: 'Blog', view: 'blog' as const },
                { label: 'Devenir proprietaire', view: 'register' as const },
              ].map(({ label, view }) => (
                <li key={label}>
                  <button
                    onClick={() => navigate(view)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm tracking-wide uppercase text-foreground/60">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                Dakar, Senegal
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a href="mailto:contact@sunulogis.sn" className="hover:text-primary transition-colors">
                  contact@sunulogis.sn
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <a href="tel:+221778057536" className="hover:text-primary transition-colors">
                  +221 77 805 75 36
                </a>
              </li>
            </ul>

            {/* Reseaux sociaux dupliques */}
            <div className="hidden md:flex flex-col gap-2 pt-1">
              <p className="text-xs text-muted-foreground">Suivez-nous</p>
              <div className="flex gap-2">
                {socialLinks.map(({ label, href, icon: Icon, hoverClass }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all duration-200 ${hoverClass}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
          </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm tracking-wide uppercase text-foreground/60">Newsletter</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Offres exclusives et bons plans hebergement au Senegal directement dans votre boite mail.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 border-green-500/60 focus-visible:ring-green-500/30 text-sm"
                disabled={subscribing}
                required
              />
              <Button type="submit" size="sm" disabled={subscribing} className="w-full gap-2">
                {subscribing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Mail className="h-3.5 w-3.5" />
                )}
                S&apos;inscrire
              </Button>
              <p className="text-[10px] text-muted-foreground">
                En vous inscrivant, vous acceptez de recevoir nos communications.
              </p>
            </form>
          </div>
          </div>

        {/* Barre du bas */}
        <div className="mt-8 border-t border-border pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            Fait avec <Heart className="h-3 w-3 text-red-500 fill-red-500 mx-0.5" /> au Senegal &mdash; &copy; {new Date().getFullYear()} SunuLogis
          </span>
          <div className="flex items-center gap-4">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </a>
            ))}
          </div>
      </div>
      </div>
    </footer>
  )
}
