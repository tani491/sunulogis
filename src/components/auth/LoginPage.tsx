'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogIn, Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { parseJsonResponse } from '@/lib/fetch-json'

export function LoginPage() {
  const { navigate, setUser } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await parseJsonResponse<
        | { error?: string }
        | {
            id: string
            email: string
            fullName: string | null
            role: string
            phone: string | null
          }
      >(res)

      if (!res.ok) {
        const errorMessage = 'error' in data ? data.error : undefined
        toast.error(errorMessage || 'Erreur de connexion')
        return
      }

      if (!('id' in data)) {
        toast.error('Réponse de connexion invalide')
        return
      }

      setUser(data)
      toast.success(`Bienvenue, ${data.fullName || data.email} !`)

      // Navigate based on role
      if (data.role === 'admin') {
        navigate('admin')
      } else {
        navigate('dashboard')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-full bg-primary/10">
            <LogIn className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <p className="text-sm text-muted-foreground">
            Connectez-vous à votre espace SunuLogis
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                Email
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
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" />
                Mot de passe
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Pas encore de compte ?{' '}
              <button
                type="button"
                onClick={() => navigate('register')}
                className="text-primary font-medium hover:underline"
              >
                S&apos;inscrire
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
