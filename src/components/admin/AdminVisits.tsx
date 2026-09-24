'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface ProspectOption {
  id: string
  name: string
  phone: string
}

interface EstablishmentOption {
  id: string
  name: string
  reference?: string | null
}

interface Visit {
  id: string
  scheduledAt: string
  status: string
  notes: string
  prospect?: ProspectOption | null
  establishment?: EstablishmentOption | null
}

const statusLabels: Record<string, string> = {
  PROGRAMMEE: 'Programmée',
  EFFECTUEE: 'Effectuée',
  ANNULEE: 'Annulée',
  REPORTEE: 'Reportée',
}

export function AdminVisits() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [prospects, setProspects] = useState<ProspectOption[]>([])
  const [establishments, setEstablishments] = useState<EstablishmentOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    prospectId: '',
    establishmentId: '',
    scheduledAt: '',
    notes: '',
  })

  async function load() {
    setLoading(true)
    try {
      const [visitsRes, prospectsRes, establishmentsRes] = await Promise.all([
        fetch('/api/admin/visits'),
        fetch('/api/admin/prospects'),
        fetch('/api/admin/establishments'),
      ])
      if (visitsRes.ok) setVisits(await visitsRes.json())
      if (prospectsRes.ok) setProspects((await prospectsRes.json()).map((p: any) => ({ id: p.id, name: p.name, phone: p.phone })))
      if (establishmentsRes.ok) setEstablishments((await establishmentsRes.json()).map((e: any) => ({ id: e.id, name: e.name, reference: e.reference })))
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

  async function createVisit(event: React.FormEvent) {
    event.preventDefault()
    if (!form.scheduledAt) {
      toast.error('Date requise')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          prospectId: form.prospectId || null,
          establishmentId: form.establishmentId || null,
        }),
      })
      if (!res.ok) {
        toast.error('Planification impossible')
        return
      }
      toast.success('Visite programmée')
      setForm({ prospectId: '', establishmentId: '', scheduledAt: '', notes: '' })
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function updateVisit(id: string, status: string) {
    const res = await fetch('/api/admin/visits', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (!res.ok) {
      toast.error('Mise à jour impossible')
      return
    }
    toast.success('Visite mise à jour')
    await load()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <CalendarDays className="h-6 w-6 text-primary" />
          Visites
        </h1>
        <p className="text-sm text-muted-foreground">Planification et suivi des rendez-vous.</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={createVisit} className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_220px_1fr_auto] lg:items-end">
            <div className="space-y-2">
              <Label>Prospect</Label>
              <Select value={form.prospectId} onValueChange={(value) => setForm((current) => ({ ...current, prospectId: value }))}>
                <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  {prospects.map((prospect) => (
                    <SelectItem key={prospect.id} value={prospect.id}>{prospect.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bien</Label>
              <Select value={form.establishmentId} onValueChange={(value) => setForm((current) => ({ ...current, establishmentId: value }))}>
                <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  {establishments.map((establishment) => (
                    <SelectItem key={establishment.id} value={establishment.id}>{establishment.reference ? `${establishment.reference} - ` : ''}{establishment.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="visit-date">Date</Label>
              <Input id="visit-date" type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm((current) => ({ ...current, scheduledAt: e.target.value }))} />
            </div>
            <Textarea value={form.notes} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} placeholder="Notes de rendez-vous" rows={2} />
            <Button type="submit" className="gap-2" disabled={saving}>
              <Plus className="h-4 w-4" />
              Planifier
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {visits.map((visit) => (
          <Card key={visit.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold">{new Date(visit.scheduledAt).toLocaleString('fr-FR')}</p>
                  <p className="text-sm text-muted-foreground">{visit.prospect?.name || 'Prospect non lié'} · {visit.establishment?.name || 'Bien non lié'}</p>
                </div>
                <Badge>{statusLabels[visit.status] || visit.status}</Badge>
              </div>
              {visit.notes ? <p className="rounded-md bg-muted p-2 text-sm text-muted-foreground">{visit.notes}</p> : null}
              <Select value={visit.status} onValueChange={(status) => updateVisit(visit.id, status)}>
                <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
