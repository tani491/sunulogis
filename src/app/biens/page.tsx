import type { Metadata } from 'next'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { HomePage } from '@/components/public/HomePage'

export const metadata: Metadata = {
  title: 'Biens à vendre et à louer',
  description: 'Catalogue SunuLogis de biens immobiliers à vendre et à louer au Sénégal.',
  alternates: { canonical: '/biens' },
}

export default function PropertiesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-6">
        <HomePage />
      </main>
      <Footer />
    </div>
  )
}

