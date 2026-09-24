'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CalendarClock, Phone, UserRound } from 'lucide-react'
import { toast } from 'sonner'

const statusLabels: Record<string, string> = {
  NOUVEAU: 'Nouveau',
  QUALIFIE: 'Qualifié',
  VISITE_PROGRAMMEE: 'Visite programmée',
  NEGOCIATION: 'Négociation',
  CONCLU: 'Conclu',
  PERDU: 'Perdu',
}

const projectLabels: Record<string, string> = {
  VENTE: 'Achat',
  LOCATION_MENSUELLE: 'Location',
  SEJOUR_NUITEE: 'Séjour',
}

interface Prospect {
  id: string
  name: string
  phone: string
  email?: string | null
  status: string
  projectType?: string | null
  desiredZone: string
  budget?: number | null
  timeframe: string
  notes: string
  followUpAt?: string | null
  createdAt: string
}

export function AdminProspects() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<Record<string, string>>({})

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/prospects')
      if (!res.ok) return
      const data = await res.json()
      setProspects(Array.isArray(data) ? data : [])
      setNotes(Object.fromEntries((Array.isArray(data) ? data : []).map((p: Prospect) => [p.id, p.notes || ''])))
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

  async function updateProspect(id: string, updates: Record<string, unknown>) {
    const res = await fetch('/api/admin/prospects', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })

    if (!res.ok) {
      toast.error('Mise à jour impossible')
      return
    }

    toast.success('Prospect mis à jour')
    await load()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <UserRound className="h-6 w-6 text-primary" />
          Prospects
        </h1>
        <p className="text-sm text-muted-foreground">Demandes entrantes et suivi commercial léger.</p>
      </div>

      {prospects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">Aucun prospect enregistré.</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {prospects.map((prospect) => (
            <Card key={prospect.id}>
              <CardContent className="space-y-4 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="font-semibold">{prospect.name}</h2>
                    <a href={`tel:${prospect.phone}`} className="mt-1 flex items-center gap-1 text-sm text-primary">
                      <Phone className="h-3.5 w-3.5" />
                      {prospect.phone}
                    </a>
                    {prospect.email ? <p className="break-all text-xs text-muted-foreground">{prospect.email}</p> : null}
                  </div>
                  <Badge>{statusLabels[prospect.status] || prospect.status}</Badge>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Projet</p>
                    <p className="font-medium">{prospect.projectType ? projectLabels[prospect.projectType] : 'À préciser'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Zone</p>
                    <p className="font-medium">{prospect.desiredZone || 'À préciser'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="font-medium">{prospect.budget ? `${prospect.budget.toLocaleString()} FCFA` : 'À préciser'}</p>
                  </div>
                </div>

                {prospect.timeframe ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarClock className="h-4 w-4" />
                    Échéance : {prospect.timeframe}
                  </p>
                ) : null}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[220px_1fr_auto] sm:items-end">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Statut</p>
                    <Select value={prospect.status} onValueChange={(status) => updateProspect(prospect.id, { status })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    value={notes[prospect.id] ?? ''}
                    onChange={(event) => setNotes((current) => ({ ...current, [prospect.id]: event.target.value }))}
                    placeholder="Notes de qualification, relance, objections..."
                    rows={2}
                  />
                  <Button type="button" variant="outline" onClick={() => updateProspect(prospect.id, { notes: notes[prospect.id] ?? '' })}>
                    Sauver
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
