'use client'

import { useEffect } from 'react'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { LoginPage } from '@/components/auth/LoginPage'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useAppStore } from '@/store/app-store'
import { parseJsonResponse } from '@/lib/fetch-json'

export default function SunuPortailGestionRoute() {
  const { currentUser, currentView, setUser, navigate } = useAppStore()
  const isAdminView = currentView.startsWith('admin') && currentUser?.role === 'admin'

  useEffect(() => {
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

        if (data?.role === 'admin') {
          setUser(data)
          navigate('admin')
        }
      } catch {
        // Keep the login form visible when no admin session exists.
      }
    }

    void checkSession()
  }, [navigate, setUser])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {isAdminView ? (
          <AdminLayout />
        ) : (
          <div className="container mx-auto px-4 py-6">
            <LoginPage />
          </div>
        )}
      </main>
      {!isAdminView && <Footer />}
    </div>
  )
}
