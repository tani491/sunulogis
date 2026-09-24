import type { Metadata } from 'next'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { BlogPage } from '@/components/public/BlogPage'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Conseils SunuLogis pour acheter, louer et préparer un projet immobilier au Sénégal.',
  alternates: { canonical: '/blog' },
}

export default function BlogIndexRoute() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-6">
        <BlogPage />
      </main>
      <Footer />
    </div>
  )
}

