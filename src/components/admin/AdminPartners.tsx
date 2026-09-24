'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Handshake, Phone, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Partner {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  company?: string | null
  mandateDetails: string
  notes: string
  establishments: { id: string; name: string }[]
}

export function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    mandateDetails: '',
    notes: '',
  })

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/partners')
      if (!res.ok) return
      const data = await res.json()
      setPartners(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))

  async function createPartner(event: React.FormEvent) {
    event.preventDefault()
    if (!form.name.trim()) {
      toast.error('Nom requis')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        toast.error('Création impossible')
        return
      }

      toast.success('Partenaire ajouté')
      setForm({ name: '', phone: '', email: '', company: '', mandateDetails: '', notes: '' })
      await load()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-44 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Handshake className="h-6 w-6 text-primary" />
          Partenaires & Mandats
        </h1>
        <p className="text-sm text-muted-foreground">Propriétaires, promoteurs et conditions de mandat.</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={createPartner} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="partner-name">Nom *</Label>
                <Input id="partner-name" value={form.name} onChange={(e) => update('name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner-company">Société</Label>
                <Input id="partner-company" value={form.company} onChange={(e) => update('company', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner-phone">Téléphone</Label>
                <Input id="partner-phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner-email">E-mail</Label>
                <Input id="partner-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Textarea value={form.mandateDetails} onChange={(e) => update('mandateDetails', e.target.value)} placeholder="Mandat, zone, barème, conditions..." rows={3} />
              <Textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Notes privées" rows={3} />
            </div>
            <Button type="submit" className="gap-2" disabled={saving}>
              <Plus className="h-4 w-4" />
              Ajouter
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {partners.map((partner) => (
          <Card key={partner.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{partner.name}</h2>
                  {partner.company ? <p className="text-sm text-muted-foreground">{partner.company}</p> : null}
                </div>
                <Badge variant="outline">{partner.establishments.length} bien{partner.establishments.length !== 1 ? 's' : ''}</Badge>
              </div>
              {partner.phone ? (
                <a href={`tel:${partner.phone}`} className="flex items-center gap-1 text-sm text-primary">
                  <Phone className="h-3.5 w-3.5" />
                  {partner.phone}
                </a>
              ) : null}
              {partner.email ? <p className="break-all text-xs text-muted-foreground">{partner.email}</p> : null}
              {partner.mandateDetails ? <p className="text-sm">{partner.mandateDetails}</p> : null}
              {partner.notes ? <p className="rounded-md bg-muted p-2 text-xs text-muted-foreground">{partner.notes}</p> : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
