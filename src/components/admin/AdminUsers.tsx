'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Users, ShieldCheck, Ban, Filter, Crown, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  fullName: string | null
  role: string
  phone: string | null
  isActive: boolean
  createdAt: string
  _count: { establishments: number }
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    setActionLoading(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive }),
      })

      if (res.ok) {
        toast.success(isActive ? 'Utilisateur activé' : 'Utilisateur désactivé')
        fetchUsers()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erreur')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erreur serveur')
    } finally {
      setActionLoading(null)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="gap-1 bg-purple-600"><Crown className="h-3 w-3" /> Super Admin</Badge>
      case 'admin':
        return <Badge className="gap-1 bg-red-600"><ShieldCheck className="h-3 w-3" /> Admin</Badge>
      case 'owner':
        return <Badge className="gap-1 bg-primary"><Shield className="h-3 w-3 hidden" /> Propriétaire</Badge>
      case 'client':
        return <Badge variant="secondary" className="gap-1">Client</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const filteredUsers = users.filter((user) => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false
    if (statusFilter === 'active' && !user.isActive) return false
    if (statusFilter === 'suspended' && user.isActive) return false
    return true
  })

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
          <Users className="h-6 w-6 text-primary" />
          Utilisateurs ({users.length})
        </h1>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="owner">Propriétaires</SelectItem>
              <SelectItem value="client">Clients</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actifs</SelectItem>
              <SelectItem value="suspended">Désactivés</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">Aucun utilisateur trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Établissements</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName || '—'}</TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-sm">{user.phone || '—'}</TableCell>
                    <TableCell>
                      {user.role === 'owner' ? (
                        <Badge variant="outline">{user._count.establishments}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge className="gap-1 bg-green-600">Actif</Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">Désactivé</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.role !== 'super_admin' && (
                        user.isActive ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="gap-1 text-destructive hover:text-destructive" disabled={actionLoading === user.id}>
                                <Ban className="h-3 w-3" />
                                Désactiver
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Désactiver l&apos;utilisateur ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Désactiver {user.fullName || user.email} ? Il ne pourra plus se connecter.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => toggleUserStatus(user.id, false)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Désactiver
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-green-600 hover:text-green-700"
                            onClick={() => toggleUserStatus(user.id, true)}
                            disabled={actionLoading === user.id}
                          >
                            <ShieldCheck className="h-3 w-3" />
                            Activer
                          </Button>
                        )
                      )}
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
