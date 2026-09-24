'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, SearchCheck } from 'lucide-react'

export function CustomSearchRequestForm() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    projectType: 'VENTE',
    desiredZone: '',
    budget: '',
    timeframe: '',
    notes: '',
  })

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Nom et téléphone sont requis')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          budget: form.budget ? Number(form.budget) : null,
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(data.error || 'Impossible d’enregistrer la demande')
        return
      }

      toast.success('Votre demande a bien été transmise à SunuLogis')
      setForm({
        name: '',
        phone: '',
        email: '',
        projectType: 'VENTE',
        desiredZone: '',
        budget: '',
        timeframe: '',
        notes: '',
      })
    } catch (error) {
      console.error(error)
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="custom-name">Nom complet *</Label>
          <Input id="custom-name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Votre nom" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="custom-phone">Téléphone *</Label>
          <Input id="custom-phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+221 77 000 00 00" required />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="custom-email">E-mail</Label>
          <Input id="custom-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="vous@email.com" />
        </div>
        <div className="space-y-2">
          <Label>Type de projet</Label>
          <Select value={form.projectType} onValueChange={(value) => update('projectType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Projet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VENTE">Achat</SelectItem>
              <SelectItem value="LOCATION_MENSUELLE">Location</SelectItem>
              <SelectItem value="SEJOUR_NUITEE">Séjour courte durée</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="custom-zone">Zone souhaitée</Label>
          <Input id="custom-zone" value={form.desiredZone} onChange={(e) => update('desiredZone', e.target.value)} placeholder="Almadies, Ngor, Saly..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="custom-budget">Budget FCFA</Label>
          <Input id="custom-budget" type="number" min="0" value={form.budget} onChange={(e) => update('budget', e.target.value)} placeholder="150000000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="custom-timeframe">Échéance</Label>
          <Input id="custom-timeframe" value={form.timeframe} onChange={(e) => update('timeframe', e.target.value)} placeholder="Ce mois-ci, 3 mois..." />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-notes">Précisions utiles</Label>
        <Textarea id="custom-notes" value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Nombre de chambres, étage, parking, ascenseur, préférences de quartier..." rows={3} />
      </div>

      <Button type="submit" className="w-full gap-2 md:w-auto" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchCheck className="h-4 w-4" />}
        Envoyer ma demande
      </Button>
    </form>
  )
}

