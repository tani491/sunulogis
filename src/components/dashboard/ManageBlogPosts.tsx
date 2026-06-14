'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { DragDropImageUpload } from '@/components/shared/DragDropImageUpload'
import { BLOG_CATEGORIES } from '@/lib/constants'
import { Lock, Newspaper, Pencil, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string | null
  category: string
  createdAt: string
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function ManageBlogPosts() {
  const { currentUser } = useAppStore()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [coverImages, setCoverImages] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  async function fetchPosts() {
    setLoadingPosts(true)
    try {
      const res = await fetch('/api/blog?mine=true')
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      }
    } catch (error) {
      console.error(error)
      toast.error('Erreur de chargement des articles')
    } finally {
      setLoadingPosts(false)
    }
  }

  useEffect(() => {
    if (currentUser?.isSubscribed) {
      const timeoutId = window.setTimeout(() => {
        void fetchPosts()
      }, 0)

      return () => window.clearTimeout(timeoutId)
    }
  }, [currentUser?.isSubscribed])

  if (!currentUser?.isSubscribed) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <Lock className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <h1 className="text-xl font-bold">Blog réservé aux abonnés SunuPro</h1>
          <p className="text-sm text-muted-foreground">
            Activez SunuPro pour publier vos articles.
          </p>
        </CardContent>
      </Card>
    )
  }

  const resetForm = () => {
    setEditingPost(null)
    setTitle('')
    setExcerpt('')
    setContent('')
    setCategory('general')
    setCoverImages([])
  }

  const startEdit = (post: BlogPost) => {
    setEditingPost(post)
    setTitle(post.title)
    setExcerpt(post.excerpt)
    setContent(post.content)
    setCategory(post.category)
    setCoverImages(post.coverImage ? [post.coverImage] : [])
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
        title: title.trim(),
        slug: generateSlug(title),
        excerpt,
        content,
        coverImage: coverImages[0] || null,
        category,
      }
      const res = await fetch(editingPost ? `/api/blog/${editingPost.slug}` : '/api/blog', {
        method: editingPost ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erreur')
        return
      }

      toast.success(editingPost ? 'Article mis à jour' : 'Article publié')
      resetForm()
      await fetchPosts()
    } catch (error) {
      console.error(error)
      toast.error('Erreur serveur')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (post: BlogPost) => {
    try {
      const res = await fetch(`/api/blog/${post.slug}`, { method: 'DELETE' })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erreur')
        return
      }

      toast.success('Article supprimé')
      if (editingPost?.id === post.id) resetForm()
      await fetchPosts()
    } catch (error) {
      console.error(error)
      toast.error('Erreur serveur')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-primary" />
          Mes articles
        </h1>
        <p className="text-sm text-muted-foreground">
          Vos articles sont publiés immédiatement sur le site.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingPost ? 'Modifier l’article' : 'Nouvel article'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="owner-blog-title">Titre *</Label>
              <Input
                id="owner-blog-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Votre guide logement à Dakar"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOG_CATEGORIES.filter((cat) => cat.value !== 'all').map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner-blog-excerpt">Extrait</Label>
              <Textarea
                id="owner-blog-excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Résumé court de l'article"
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
              <Label htmlFor="owner-blog-content">Contenu *</Label>
              <Textarea
                id="owner-blog-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Rédigez votre article ici..."
                rows={12}
                className="min-h-[220px]"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Enregistrement...' : editingPost ? 'Mettre à jour' : 'Publier l’article'}
              </Button>
              {editingPost && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Articles publiés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingPosts ? (
            <p className="text-sm text-muted-foreground">Chargement...</p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun article publié pour le moment.</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="font-semibold">{post.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt || 'Aucun extrait renseigné.'}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button type="button" size="sm" variant="outline" className="gap-1" onClick={() => startEdit(post)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Modifier
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" size="sm" variant="outline" className="gap-1 text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. L&apos;article &ldquo;{post.title}&rdquo; sera supprimé.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(post)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
