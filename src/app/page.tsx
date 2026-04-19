'use client'

import { useEffect } from 'react'
import { useAppStore, type View } from '@/store/app-store'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { HomePage } from '@/components/public/HomePage'
import { HostelDetailPage } from '@/components/public/HostelDetailPage'
import { LoginPage } from '@/components/auth/LoginPage'
import { RegisterPage } from '@/components/auth/RegisterPage'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
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
      home: <HomePage />,
      'hostel-detail': <HostelDetailPage />,
      login: <LoginPage />,
      register: <RegisterPage />,
      dashboard: <DashboardLayout />,
      'dashboard-hostel': <DashboardLayout />,
      'dashboard-rooms': <DashboardLayout />,
      'dashboard-bookings': <DashboardLayout />,
    }
    return views[currentView] || <HomePage />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
