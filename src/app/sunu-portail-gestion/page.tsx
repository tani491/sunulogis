import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { LoginPage } from '@/components/auth/LoginPage'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { getSessionUser, isAdminRole } from '@/lib/auth'

export default async function SunuPortailGestionRoute() {
  const user = await getSessionUser()
  const isAdmin = isAdminRole(user?.role)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {isAdmin ? (
          <AdminLayout />
        ) : (
          <div className="container mx-auto px-4 py-6">
            <LoginPage />
          </div>
        )}
      </main>
      {!isAdmin && <Footer />}
    </div>
  )
}

