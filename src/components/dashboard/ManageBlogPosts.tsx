'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DragDropImageUpload } from '@/components/shared/DragDropImageUpload'
import { BLOG_CATEGORIES } from '@/lib/constants'
import { Lock, Newspaper, Save } from 'lucide-react'
import { toast } from 'sonner'

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
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [coverImages, setCoverImages] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  if (!currentUser?.isSubscribed) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <Lock className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <h1 className="text-xl font-bold">Blog réservé aux abonnés SunuPro</h1>
          <p className="text-sm text-muted-foreground">
            Activez SunuPro pour proposer des articles à la modération.
          </p>
        </CardContent>
      </Card>
    )
  }

  const resetForm = () => {
    setTitle('')
    setExcerpt('')
    setContent('')
    setCategory('general')
    setCoverImages([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Le titre est requis')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: generateSlug(title),
          excerpt,
          content,
          coverImage: coverImages[0] || null,
          category,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erreur')
        return
      }

      toast.success('Article envoyé en modération')
      resetForm()
    } catch (error) {
      console.error(error)
      toast.error('Erreur serveur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-primary" />
          Proposer un article
        </h1>
        <p className="text-sm text-muted-foreground">
          Les articles sont relus par l&apos;administration avant publication.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nouvel article</CardTitle>
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

            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Envoi...' : 'Envoyer en modération'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
