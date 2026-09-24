import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeft, BookOpen, Calendar, Clock, User } from 'lucide-react'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { db } from '@/lib/db'

type Props = { params: Promise<{ slug: string }> }

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

async function getPost(slug: string) {
  return db.blogPost.findFirst({
    where: { slug, isPublished: true },
    include: { author: { select: { name: true, email: true } } },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return { title: 'Article introuvable' }
  }

  return {
    title: post.title,
    description: post.excerpt || post.title,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      type: 'article',
      url: `/blog/${post.slug}`,
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: post.coverImage ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.title,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  }
}

export default async function BlogPostRoute({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) notFound()

  const recentPosts = await db.blogPost.findMany({
    where: { isPublished: true, slug: { not: post.slug } },
    orderBy: { createdAt: 'desc' },
    take: 4,
    select: { id: true, title: true, slug: true, createdAt: true },
  })

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-6">
        <div className="mx-auto max-w-5xl">
          <Button variant="ghost" className="mb-6 gap-2" asChild>
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4" />
              Retour au blog
            </Link>
          </Button>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <article className="space-y-6 lg:col-span-2">
              {post.coverImage && (
                <div className="relative h-64 overflow-hidden rounded-xl md:h-96">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    priority
                    sizes="(max-width: 1023px) 100vw, 66vw"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                <Badge className={getCategoryColor(post.category)}>{getCategoryLabel(post.category)}</Badge>
                <h1 className="text-2xl font-bold leading-tight md:text-4xl">{post.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    {post.author.name || 'Rédacteur SunuLogis'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {format(post.createdAt, 'dd MMMM yyyy', { locale: fr })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {Math.max(3, Math.ceil(post.content.length / 1500))} min de lecture
                  </span>
                </div>
              </div>

              <div className="prose prose-gray max-w-none">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>
            </article>

            <aside className="space-y-6">
              {post.excerpt && (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium italic text-muted-foreground">&ldquo;{post.excerpt}&rdquo;</p>
                  </CardContent>
                </Card>
              )}

              {recentPosts.length > 0 && (
                <Card>
                  <CardContent className="space-y-3 p-4">
                    <h2 className="flex items-center gap-2 font-semibold">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Articles récents
                    </h2>
                    {recentPosts.map((recent) => (
                      <Link
                        key={recent.id}
                        href={`/blog/${recent.slug}`}
                        className="block border-b py-1.5 text-sm transition-colors last:border-0 hover:text-primary"
                      >
                        <span className="line-clamp-2 font-medium">{recent.title}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {format(recent.createdAt, 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

