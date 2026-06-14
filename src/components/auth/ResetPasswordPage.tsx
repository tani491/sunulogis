'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { parseJsonResponse } from '@/lib/fetch-json'

interface ResetPasswordPageProps {
  token: string
}

function getPasswordError(password: string, confirmPassword: string): string | null {
  if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caracteres'
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'Ajoutez une majuscule, une minuscule et un chiffre'
  }
  if (password !== confirmPassword) return 'Les mots de passe ne correspondent pas'
  return null
}

export function ResetPasswordPage({ token }: ResetPasswordPageProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = getPasswordError(password, confirmPassword)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await parseJsonResponse<{ error?: string; success?: boolean }>(res)

      if (!res.ok) {
        toast.error(data.error || 'Lien invalide ou expire')
        return
      }

      setSuccess(true)
      toast.success('Mot de passe mis a jour')
    } catch (error) {
      console.error(error)
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center space-y-4">
            <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="font-semibold">Lien de reinitialisation invalide.</p>
            <Button asChild className="w-full h-auto py-3 text-lg font-bold">
              <a href="/forgot-password">Demander un nouveau lien</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-full bg-emerald-100">
            <Lock className="h-7 w-7 text-emerald-700" />
          </div>
          <CardTitle className="text-2xl">Nouveau mot de passe</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choisissez un mot de passe securise pour votre compte SunuLogis.
          </p>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Votre mot de passe a ete mis a jour. Vous pouvez maintenant vous connecter.
              </p>
              <Button asChild className="w-full h-auto py-3 text-lg font-bold">
                <a href="/">Retour a la connexion</a>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5" />
                  Nouveau mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-11"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-password" className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5" />
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="confirm-new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirmez le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Utilisez au moins 8 caracteres, avec une majuscule, une minuscule et un chiffre.
              </p>

              <Button type="submit" className="w-full h-auto py-3 text-lg font-bold" disabled={loading}>
                {loading ? 'Mise a jour...' : 'Mettre a jour'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
