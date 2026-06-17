'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useAppStore, type View } from '@/store/app-store'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { LandingPage } from '@/components/public/LandingPage'
import { AnimatePresence, motion } from 'framer-motion'
import { parseJsonResponse } from '@/lib/fetch-json'

function ViewSkeleton() {
  return (
    <div className="space-y-4 py-8">
      <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
      <div className="h-40 rounded-xl bg-muted animate-pulse" />
    </div>
  )
}

const HomePage = dynamic(() => import('@/components/public/HomePage').then((mod) => mod.HomePage), {
  loading: () => <ViewSkeleton />,
})
const EstablishmentDetailPage = dynamic(
  () => import('@/components/public/EstablishmentDetailPage').then((mod) => mod.EstablishmentDetailPage),
  { loading: () => <ViewSkeleton /> }
)
const BlogPage = dynamic(() => import('@/components/public/BlogPage').then((mod) => mod.BlogPage), {
  loading: () => <ViewSkeleton />,
})
const BlogPostPage = dynamic(() => import('@/components/public/BlogPostPage').then((mod) => mod.BlogPostPage), {
  loading: () => <ViewSkeleton />,
})
const LoginPage = dynamic(() => import('@/components/auth/LoginPage').then((mod) => mod.LoginPage), {
  loading: () => <ViewSkeleton />,
})
const RegisterPage = dynamic(() => import('@/components/auth/RegisterPage').then((mod) => mod.RegisterPage), {
  loading: () => <ViewSkeleton />,
})
const DashboardLayout = dynamic(
  () => import('@/components/dashboard/DashboardLayout').then((mod) => mod.DashboardLayout),
  { loading: () => <ViewSkeleton /> }
)
const AdminLayout = dynamic(() => import('@/components/admin/AdminLayout').then((mod) => mod.AdminLayout), {
  loading: () => <ViewSkeleton />,
})

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const pageTransition = {
  duration: 0.25,
  ease: 'easeInOut' as const,
}

export default function Home() {
  const { currentView, setUser } = useAppStore()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [currentView])

  useEffect(() => {
    // Check session on mount
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session')
        const data = await parseJsonResponse<{
          id: string
          email: string
          fullName: string | null
          role: string
          phone: string | null
          isSubscribed: boolean
          paymentReminder?: boolean
        } | null>(res)
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
      'dashboard-blog': <DashboardLayout />,
      admin: <AdminLayout />,
      'admin-stats': <AdminLayout />,
      'admin-establishments': <AdminLayout />,
      'admin-users': <AdminLayout />,
      'admin-blog': <AdminLayout />,
      'admin-subscribers': <AdminLayout />,
      'admin-commissions': <AdminLayout />,
      'admin-pro': <AdminLayout />,
      'admin-settings': <AdminLayout />,
      'admin-analytics': <AdminLayout />,
      'admin-subscription-requests': <AdminLayout />,
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
