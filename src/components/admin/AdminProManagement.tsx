'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Ban, Bell, Crown, Users } from 'lucide-react'
import { toast } from 'sonner'

interface ProUser {
  id: string
  email: string
  fullName: string | null
  role: string
  phone: string | null
  isSubscribed: boolean
  paymentReminder: boolean
  _count: { establishments: number }
}

export function AdminProManagement() {
  const [users, setUsers] = useState<ProUser[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/pro-users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchUsers()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  const updateProUser = async (userId: string, action: 'suspend' | 'remind') => {
    setActionLoading(`${userId}:${action}`)
    try {
      const res = await fetch('/api/admin/pro-users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erreur')
        return
      }

      toast.success(action === 'suspend' ? 'Abonnement suspendu' : 'Rappel envoyé')
      await fetchUsers()
    } catch (error) {
      console.error(error)
      toast.error('Erreur serveur')
    } finally {
      setActionLoading(null)
    }
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
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Crown className="h-6 w-6 text-primary" />
          Gestion Pro
        </h1>
        <p className="text-sm text-muted-foreground">
          Suivi des abonnements SunuPro, suspensions et rappels de paiement.
        </p>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Établissements</TableHead>
                  <TableHead>Abonnement</TableHead>
                  <TableHead>Rappel</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.fullName || user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user._count.establishments}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.isSubscribed ? (
                        <Badge className="bg-emerald-600">SunuPro actif</Badge>
                      ) : (
                        <Badge variant="secondary">Non abonné</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.paymentReminder ? (
                        <Badge className="bg-amber-500">Rappel actif</Badge>
                      ) : (
                        <Badge variant="outline">Aucun</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-amber-700 border-amber-300 hover:bg-amber-50"
                          disabled={actionLoading === `${user.id}:remind`}
                          onClick={() => updateProUser(user.id, 'remind')}
                        >
                          <Bell className="h-3.5 w-3.5" />
                          Rappeler
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-destructive hover:text-destructive"
                              disabled={!user.isSubscribed || actionLoading === `${user.id}:suspend`}
                            >
                              <Ban className="h-3.5 w-3.5" />
                              Suspendre
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Suspendre SunuPro ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                L&apos;accès SunuPro de {user.fullName || user.email} sera désactivé immédiatement.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => updateProUser(user.id, 'suspend')}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Suspendre
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
