'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, User, Mail, Phone, Lock, Building2, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { parseJsonResponse } from '@/lib/fetch-json'

export function RegisterPage() {
  const { navigate } = useAppStore()
  const [role, setRole] = useState<'client' | 'owner'>('owner')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName || !email) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (role === 'owner') {
      if (!password) {
        toast.error('Le mot de passe est requis pour les propriétaires')
        return
      }
      if (password.length < 6) {
        toast.error('Le mot de passe doit contenir au moins 6 caractères')
        return
      }
      if (password !== confirmPassword) {
        toast.error('Les mots de passe ne correspondent pas')
        return
      }
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          fullName,
          phone,
          password: role === 'owner' ? password : undefined,
          role,
        }),
      })

      const data = await parseJsonResponse<{ error?: string }>(res)

      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de l\'inscription')
        return
      }

      toast.success('Inscription réussie ! Connectez-vous maintenant.')
      navigate('login')
    } catch (err) {
      console.error(err)
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-full bg-primary/10">
            <UserPlus className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <p className="text-sm text-muted-foreground">
            Rejoignez SunuLogis
          </p>
        </CardHeader>
        <CardContent>
          {/* Role selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('client')}
              className={`p-4 rounded-lg border-2 transition-all text-center ${
                role === 'client'
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-muted-foreground/30'
              }`}
            >
              <MapPin className={`h-6 w-6 mx-auto mb-2 ${role === 'client' ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className={`font-medium text-sm ${role === 'client' ? 'text-primary' : 'text-muted-foreground'}`}>
                Je suis un voyageur
              </p>
              <p className="text-xs text-muted-foreground mt-1">Je cherche un logement</p>
            </button>
            <button
              type="button"
              onClick={() => setRole('owner')}
              className={`p-4 rounded-lg border-2 transition-all text-center ${
                role === 'owner'
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-muted-foreground/30'
              }`}
            >
              <Building2 className={`h-6 w-6 mx-auto mb-2 ${role === 'owner' ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className={`font-medium text-sm ${role === 'owner' ? 'text-primary' : 'text-muted-foreground'}`}>
                Je suis propriétaire
              </p>
              <p className="text-xs text-muted-foreground mt-1">Je propose un logement</p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                Nom complet *
              </Label>
              <Input
                id="fullName"
                placeholder="Amadou Diallo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.sn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" />
                Téléphone {role === 'owner' ? '*' : ''}
              </Label>
              <Input
                id="phone"
                placeholder="221770000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required={role === 'owner'}
              />
            </div>

            {role === 'owner' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5" />
                    Mot de passe *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5" />
                    Confirmer le mot de passe *
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {role === 'client' && (
              <p className="text-xs text-muted-foreground">
                En tant que voyageur, vous pouvez réserver sans mot de passe. Vous recevrez vos confirmations par WhatsApp.
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Inscription en cours...' : 'S\'inscrire'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Déjà un compte ?{' '}
              <button
                type="button"
                onClick={() => navigate('login')}
                className="text-primary font-medium hover:underline"
              >
                Se connecter
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
