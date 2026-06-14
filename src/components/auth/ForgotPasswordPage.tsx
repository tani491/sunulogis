'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { parseJsonResponse } from '@/lib/fetch-json'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Veuillez saisir votre email')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await parseJsonResponse<{ error?: string; message?: string }>(res)

      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la demande')
        return
      }

      setSent(true)
      toast.success(data.message || 'Lien envoye')
    } catch (error) {
      console.error(error)
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-full bg-emerald-100">
            <ShieldCheck className="h-7 w-7 text-emerald-700" />
          </div>
          <CardTitle className="text-2xl">Mot de passe oublie</CardTitle>
          <p className="text-sm text-muted-foreground">
            Entrez votre email pour recevoir un lien de reinitialisation.
          </p>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Si un compte existe pour cet email, un lien de reinitialisation vient d&apos;etre envoye.
              </p>
              <Button asChild className="w-full h-auto py-3 text-lg font-bold">
                <a href="/">Retour a l&apos;accueil</a>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full h-auto py-3 text-lg font-bold" disabled={loading}>
                {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <a href="/" className="text-primary font-medium hover:underline">
                  Retour a la connexion
                </a>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
