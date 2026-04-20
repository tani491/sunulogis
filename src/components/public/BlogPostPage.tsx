'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Calendar, User, BookOpen, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string | null
  category: string
  createdAt: string
  updatedAt: string
  author: { fullName: string | null; email: string }
}

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
    voyage: 'Voyage', culture: 'Culture', guide: 'Guide', actu: 'Actualités', general: 'Général',
  }
  return labels[cat] || cat
}

interface RecentPost {
  id: string
  title: string
  slug: string
  createdAt: string
}

export function BlogPostPage() {
  const { currentBlogSlug, navigate, selectBlogPost } = useAppStore()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentBlogSlug) {
      fetchPost()
      fetchRecent()
    }
  }, [currentBlogSlug])

  const fetchPost = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/blog/${currentBlogSlug}`)
      if (res.ok) {
        const data = await res.json()
        setPost(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecent = async () => {
    try {
      const res = await fetch('/api/blog')
      const data = await res.json()
      setRecentPosts(data.filter((p: RecentPost & { slug: string }) => p.slug !== currentBlogSlug).slice(0, 4))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-16">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/40" />
        <h3 className="text-lg font-semibold mt-4">Article non trouvé</h3>
        <Button variant="outline" className="mt-4" onClick={() => navigate('blog')}>
          Retour au blog
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <Button variant="ghost" className="gap-2 mb-6" onClick={() => navigate('blog')}>
        <ArrowLeft className="h-4 w-4" />
        Retour au blog
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover image */}
          {post.coverImage && (
            <div className="relative h-64 md:h-96 rounded-xl overflow-hidden">
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}

          {/* Post header */}
          <div className="space-y-4">
            <Badge className={getCategoryColor(post.category)}>
              {getCategoryLabel(post.category)}
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>{post.author.fullName || 'Rédacteur SunuLogis'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(post.createdAt), 'dd MMMM yyyy', { locale: fr })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{Math.max(3, Math.ceil(post.content.length / 1500))} min de lecture</span>
              </div>
            </div>
          </div>

          {/* Post content */}
          <div className="prose prose-gray max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Excerpt */}
          {post.excerpt && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium text-muted-foreground italic">&ldquo;{post.excerpt}&rdquo;</p>
              </CardContent>
            </Card>
          )}

          {/* Recent posts */}
          {recentPosts.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Articles récents
                </h3>
                {recentPosts.map((rp) => (
                  <button
                    key={rp.id}
                    onClick={() => selectBlogPost(rp.slug)}
                    className="block w-full text-left text-sm hover:text-primary transition-colors py-1.5 border-b last:border-0"
                  >
                    <span className="font-medium line-clamp-2">{rp.title}</span>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      {format(new Date(rp.createdAt), 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
