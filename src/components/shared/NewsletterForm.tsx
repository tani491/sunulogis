'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Loader2, CheckCircle, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface NewsletterFormProps {
  source?: string
  variant?: 'card' | 'inline'
}

export function NewsletterForm({ source = 'blog', variant = 'card' }: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [success, setSuccess] = useState(false)

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
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json()

      if (data.alreadySubscribed) {
        toast.info('Vous êtes déjà inscrit à notre newsletter !')
      } else {
        toast.success('Inscription réussie !')
        setSuccess(true)
      }
      setEmail('')
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors de l\'inscription')
    } finally {
      setSubscribing(false)
    }
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubscribe} className="flex gap-2">
        <Input
          type="email"
          placeholder="votre@email.sn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-9 text-sm max-w-xs"
          disabled={subscribing}
          required
        />
        <Button type="submit" size="sm" disabled={subscribing} className="gap-1.5">
          {subscribing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
          S&apos;abonner
        </Button>
      </form>
    )
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardContent className="p-6">
        {success ? (
          <div className="text-center space-y-2">
            <CheckCircle className="h-10 w-10 text-green-600 mx-auto" />
            <h3 className="font-semibold text-lg">Merci pour votre inscription !</h3>
            <p className="text-sm text-muted-foreground">
              Vous recevrez bientôt nos offres exclusives et bons plans.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Restez informé</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Recevez nos offres exclusives, bons plans hébergement et conseils voyage au Sénégal directement dans votre boîte mail.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="votre@email.sn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10"
                disabled={subscribing}
                required
              />
              <Button type="submit" disabled={subscribing} className="gap-1.5 shrink-0">
                {subscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                S&apos;abonner
              </Button>
            </form>
            <p className="text-[10px] text-muted-foreground">
              En vous inscrivant, vous acceptez de recevoir nos communications. Désabonnement possible à tout moment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
