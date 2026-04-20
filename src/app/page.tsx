'use client'

import { useEffect } from 'react'
import { useAppStore, type View } from '@/store/app-store'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { LandingPage } from '@/components/public/LandingPage'
import { HomePage } from '@/components/public/HomePage'
import { EstablishmentDetailPage } from '@/components/public/EstablishmentDetailPage'
import { BlogPage } from '@/components/public/BlogPage'
import { BlogPostPage } from '@/components/public/BlogPostPage'
import { LoginPage } from '@/components/auth/LoginPage'
import { RegisterPage } from '@/components/auth/RegisterPage'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AnimatePresence, motion } from 'framer-motion'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const pageTransition = {
  duration: 0.25,
  ease: 'easeInOut',
}

export default function Home() {
  const { currentView, setUser } = useAppStore()

  useEffect(() => {
    // Check session on mount
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (data && data.id) {
          setUser(data)
        }
      } catch {
        // Not logged in, that's fine
      }
    }
    checkSession()

    // Auto-seed if no data
    const seedIfEmpty = async () => {
      try {
        await fetch('/api/seed')
      } catch {
        // Ignore seed errors
      }
    }
    seedIfEmpty()
  }, [setUser])

  const renderView = () => {
    const views: Record<View, React.ReactNode> = {
      landing: <LandingPage />,
      home: <HomePage />,
      'establishment-detail': <EstablishmentDetailPage />,
      blog: <BlogPage />,
      'blog-post': <BlogPostPage />,
      login: <LoginPage />,
      register: <RegisterPage />,
      dashboard: <DashboardLayout />,
      'dashboard-establishments': <DashboardLayout />,
      'dashboard-rooms': <DashboardLayout />,
      'dashboard-bookings': <DashboardLayout />,
      admin: <AdminLayout />,
      'admin-stats': <AdminLayout />,
      'admin-establishments': <AdminLayout />,
      'admin-users': <AdminLayout />,
      'admin-blog': <AdminLayout />,
      'admin-subscribers': <AdminLayout />,
      'admin-commissions': <AdminLayout />,
    }
    return views[currentView] || <LandingPage />
  }

  // Hide footer for dashboard and admin views
  const hideFooter = currentView.startsWith('dashboard') || currentView.startsWith('admin')

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className={hideFooter ? '' : 'container mx-auto px-4 py-6'}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
      {!hideFooter && <Footer />}
    </div>
  )
}
