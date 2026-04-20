'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Mail, Download, Trash2, Users, Globe, Calendar } from 'lucide-react'
import { toast } from 'sonner'

interface Subscriber {
  id: string
  email: string
  consentStatus: boolean
  source: string
  createdAt: string
}

export function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/subscribers')
      if (res.ok) {
        const data = await res.json()
        setSubscribers(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteSubscriber = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch(`/api/subscribers?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Abonné supprimé')
        fetchSubscribers()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erreur serveur')
    } finally {
      setDeleting(null)
    }
  }

  const exportCSV = () => {
    window.open('/api/subscribers/export', '_blank')
    toast.success('Téléchargement du fichier CSV en cours...')
  }

  const getSourceBadge = (source: string) => {
    const sources: Record<string, { label: string; color: string }> = {
      footer: { label: 'Footer', color: 'bg-blue-100 text-blue-800' },
      blog: { label: 'Blog', color: 'bg-purple-100 text-purple-800' },
      landing: { label: 'Landing', color: 'bg-emerald-100 text-emerald-800' },
    }
    const s = sources[source] || { label: source, color: 'bg-gray-100 text-gray-800' }
    return <Badge className={s.color}>{s.label}</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          Abonnés Newsletter ({subscribers.length})
        </h1>

        <Button onClick={exportCSV} className="gap-2" variant="outline">
          <Download className="h-4 w-4" />
          Exporter en CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total abonnés</p>
              <p className="text-2xl font-bold">{subscribers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sources</p>
              <p className="text-2xl font-bold">{new Set(subscribers.map((s) => s.source)).size}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ce mois</p>
              <p className="text-2xl font-bold">
                {subscribers.filter((s) => {
                  const d = new Date(s.createdAt)
                  const now = new Date()
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {subscribers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">Aucun abonné pour le moment</p>
            <p className="text-sm text-muted-foreground">Les abonnés apparaîtront ici lorsqu&apos;ils s&apos;inscriront via le formulaire newsletter</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Consentement</TableHead>
                  <TableHead>Date d&apos;inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.email}</TableCell>
                    <TableCell>{getSourceBadge(sub.source)}</TableCell>
                    <TableCell>
                      {sub.consentStatus ? (
                        <Badge className="bg-green-100 text-green-800">Oui</Badge>
                      ) : (
                        <Badge variant="secondary">Non</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(sub.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" disabled={deleting === sub.id}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer cet abonné ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Supprimer {sub.email} de la liste des abonnés ?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteSubscriber(sub.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
