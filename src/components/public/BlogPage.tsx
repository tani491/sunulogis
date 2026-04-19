'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, ArrowRight, Calendar, User, Search } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string | null
  category: string
  isPublished: boolean
  createdAt: string
  author: { fullName: string | null; email: string }
}

const blogCategories = [
  { value: 'all', label: 'Tous' },
  { value: 'voyage', label: 'Voyage' },
  { value: 'culture', label: 'Culture' },
  { value: 'guide', label: 'Guide' },
  { value: 'actu', label: 'Actualités' },
]

const getCategoryColor = (cat: string) => {
  const colors: Record<string, string> = {
    voyage: 'bg-blue-100 text-blue-800',
    culture: 'bg-purple-100 text-purple-800',
    guide: 'bg-green-100 text-green-800',
    actu: 'bg-orange-100 text-orange-800',
    general: 'bg-gray-100 text-gray-800',
  }
  return colors[cat] || colors.general
}

const getCategoryLabel = (cat: string) => {
  const labels: Record<string, string> = {
    voyage: 'Voyage',
    culture: 'Culture',
    guide: 'Guide',
    actu: 'Actualités',
    general: 'Général',
  }
  return labels[cat] || cat
}

export function BlogPage() {
  const { selectBlogPost } = useAppStore()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    fetchPosts()
  }, [activeCategory])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const url = activeCategory !== 'all' ? `/api/blog?category=${activeCategory}` : '/api/blog'
      const res = await fetch(url)
      const data = await res.json()
      setPosts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold">Blog SunuLogis</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Conseils de voyage, guides pratiques et actualités sur le Sénégal. Tout pour préparer votre séjour.
        </p>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {blogCategories.map((cat) => (
          <Button
            key={cat.value}
            variant={activeCategory === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Posts grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="h-48 bg-muted" />
              <CardContent className="p-4 space-y-3">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/40" />
          <h3 className="text-lg font-semibold mt-4">Aucun article</h3>
          <p className="text-muted-foreground">Revenez bientôt pour de nouveaux contenus</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
              onClick={() => selectBlogPost(post.slug)}
            >
              <div className="relative h-48 overflow-hidden bg-muted">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-primary/10">
                    <BookOpen className="h-12 w-12 text-primary/40" />
                  </div>
                )}
                <Badge className={`absolute top-3 left-3 ${getCategoryColor(post.category)}`}>
                  {getCategoryLabel(post.category)}
                </Badge>
              </div>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{post.author.fullName || 'Rédacteur'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(post.createdAt), 'dd MMM yyyy', { locale: fr })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
