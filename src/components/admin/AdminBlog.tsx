'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DragDropImageUpload } from '@/components/shared/DragDropImageUpload'
import { BookOpen, Plus, Pencil, Trash2, Newspaper } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string | null
  category: string
  isPublished: boolean
  createdAt: string
  author: { fullName: string | null }
}

const blogCategories = [
  { value: 'general', label: 'Général' },
  { value: 'voyage', label: 'Voyage' },
  { value: 'culture', label: 'Culture' },
  { value: 'guide', label: 'Guide' },
  { value: 'actu', label: 'Actualités' },
]

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [saving, setSaving] = useState(false)

  // Form
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImages, setCoverImages] = useState<string[]>([])
  const [category, setCategory] = useState('general')
  const [isPublished, setIsPublished] = useState(false)
  const [slugManual, setSlugManual] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/blog/all')
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setTitle('')
    setSlug('')
    setExcerpt('')
    setContent('')
    setCoverImages([])
    setCategory('general')
    setIsPublished(false)
    setSlugManual(false)
    setEditingPost(null)
    setShowDialog(true)
  }

  const startEdit = (post: BlogPost) => {
    setTitle(post.title)
    setSlug(post.slug)
    setExcerpt(post.excerpt)
    setContent(post.content)
    setCoverImages(post.coverImage ? [post.coverImage] : [])
    setCategory(post.category)
    setIsPublished(post.isPublished)
    setSlugManual(true)
    setEditingPost(post)
    setShowDialog(true)
  }

  const resetForm = () => {
    setTitle('')
    setSlug('')
    setExcerpt('')
    setContent('')
    setCoverImages([])
    setCategory('general')
    setIsPublished(false)
    setEditingPost(null)
    setShowDialog(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Le titre est requis')
      return
    }

    setSaving(true)
    try {
      const payload = {
        title,
        slug: slug || generateSlug(title),
        excerpt,
        content,
        coverImage: coverImages[0] || null,
        category,
        isPublished,
      }

      if (editingPost) {
        const res = await fetch(`/api/blog/${editingPost.slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const data = await res.json()
          toast.error(data.error || 'Erreur')
          return
        }
        toast.success('Article mis à jour !')
      } else {
        const res = await fetch('/api/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const data = await res.json()
          toast.error(data.error || 'Erreur')
          return
        }
        toast.success('Article créé !')
      }

      resetForm()
      fetchPosts()
    } catch (err) {
      console.error(err)
      toast.error('Erreur serveur')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (slug: string) => {
    try {
      const res = await fetch(`/api/blog/${slug}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error('Erreur lors de la suppression')
        return
      }
      toast.success('Article supprimé')
      fetchPosts()
    } catch (err) {
      console.error(err)
      toast.error('Erreur serveur')
    }
  }

  const getCategoryLabel = (cat: string) => {
    return blogCategories.find(c => c.value === cat)?.label || cat
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 w-full bg-muted animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-primary" />
          Blog
        </h1>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvel article
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Newspaper className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <h3 className="text-lg font-semibold">Aucun article</h3>
            <p className="text-sm text-muted-foreground">Créez votre premier article de blog</p>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvel article
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{post.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getCategoryLabel(post.category)}</Badge>
                    </TableCell>
                    <TableCell>
                      {post.isPublished ? (
                        <Badge className="bg-green-100 text-green-800">Publié</Badge>
                      ) : (
                        <Badge variant="secondary">Brouillon</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(post.createdAt), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(post)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. L&apos;article &ldquo;{post.title}&rdquo; sera définitivement supprimé.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(post.slug)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Supprimer
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

      {/* Create/Edit dialog */}
      <Dialog open={showDialog} onOpenChange={(v) => { if (!v) resetForm() }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Modifier l\'article' : 'Nouvel article'}</DialogTitle>
            <DialogDescription>
              {editingPost ? 'Modifiez le contenu de l\'article' : 'Rédigez un nouvel article pour le blog'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (!slugManual) {
                    setSlug(generateSlug(e.target.value))
                  }
                }}
                placeholder="Les meilleures plages du Sénégal"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value)
                  setSlugManual(true)
                }}
                placeholder="les-meilleures-plages-du-senegal"
              />
              <p className="text-xs text-muted-foreground">Généré automatiquement à partir du titre. Modifiable manuellement.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {blogCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex items-end">
                <div className="flex items-center gap-3 pb-2">
                  <Switch checked={isPublished} onCheckedChange={setIsPublished} id="published" />
                  <Label htmlFor="published">{isPublished ? 'Publié' : 'Brouillon'}</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Extrait</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Un résumé court de l'article..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Image de couverture</Label>
              <DragDropImageUpload
                images={coverImages}
                onImagesChange={setCoverImages}
                maxImages={1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Contenu *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Rédigez votre article ici...&#10;&#10;Utilisez ## pour les titres de section&#10;Utilisez ### pour les sous-titres&#10;Utilisez - pour les listes"
                rows={12}
                className="min-h-[200px]"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Enregistrement...' : editingPost ? 'Mettre à jour' : 'Créer l\'article'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
