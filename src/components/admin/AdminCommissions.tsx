'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Banknote, CheckCircle2, FileText, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

interface Commission {
  id: string
  type: string
  amountEstimated?: number | null
  amountInvoiced?: number | null
  amountCollected?: number | null
  status: string
  notes: string
  partner?: { name: string; company?: string | null } | null
  establishment?: { name: string; reference?: string | null } | null
  prospect?: { name: string; phone: string } | null
  createdAt: string
}

interface CommissionResponse {
  stats: {
    estimated: number
    acquired: number
    collected: number
  }
  commissions: Commission[]
}

const statusLabels: Record<string, string> = {
  ESTIMEE: 'Estimée',
  ACQUISE: 'Acquise',
  ENCAISSEE: 'Encaissée',
  ANNULEE: 'Annulée',
}

function formatAmount(value?: number | null) {
  return value ? `${value.toLocaleString()} FCFA` : '—'
}

export function AdminCommissions() {
  const [data, setData] = useState<CommissionResponse | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/commissions')
      if (!res.ok) return
      setData(await res.json())
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

  async function updateStatus(id: string, status: string) {
    const payload: Record<string, unknown> = { id, status }
    if (status === 'ENCAISSEE') payload.paidAt = new Date().toISOString()

    const res = await fetch('/api/admin/commissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      toast.error('Mise à jour impossible')
      return
    }

    toast.success('Commission mise à jour')
    await load()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  const commissions = data?.commissions ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Banknote className="h-6 w-6 text-primary" />
          Commissions
        </h1>
        <p className="text-sm text-muted-foreground">Suivi des montants estimables, facturés et encaissés.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Estimées / acquises</p>
              <p className="text-2xl font-bold">{((data?.stats.estimated ?? 0) + (data?.stats.acquired ?? 0)).toLocaleString()} FCFA</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <FileText className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-sm text-muted-foreground">Acquises</p>
              <p className="text-2xl font-bold">{(data?.stats.acquired ?? 0).toLocaleString()} FCFA</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            <div>
              <p className="text-sm text-muted-foreground">Encaissées</p>
              <p className="text-2xl font-bold">{(data?.stats.collected ?? 0).toLocaleString()} FCFA</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {commissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">Aucune commission suivie pour l’instant.</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {commissions.map((commission) => (
            <Card key={commission.id}>
              <CardContent className="space-y-4 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-semibold">
                      {commission.establishment?.reference ? `${commission.establishment.reference} - ` : ''}
                      {commission.establishment?.name || commission.prospect?.name || 'Commission'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {commission.partner?.name || 'Partenaire non lié'}
                      {commission.partner?.company ? ` · ${commission.partner.company}` : ''}
                    </p>
                  </div>
                  <Badge>{statusLabels[commission.status] || commission.status}</Badge>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Estimé</p>
                    <p className="font-medium">{formatAmount(commission.amountEstimated)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Facturé</p>
                    <p className="font-medium">{formatAmount(commission.amountInvoiced)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Encaissé</p>
                    <p className="font-medium">{formatAmount(commission.amountCollected)}</p>
                  </div>
                </div>

                {commission.notes ? <p className="rounded-md bg-muted p-2 text-sm text-muted-foreground">{commission.notes}</p> : null}

                <Select value={commission.status} onValueChange={(status) => updateStatus(commission.id, status)}>
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
      )}
    </div>
  )
}
