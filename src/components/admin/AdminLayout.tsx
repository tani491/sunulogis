'use client'

import { useAppStore, type View } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LayoutDashboard, Building2, Users, Menu, X, Shield, Newspaper, Settings, Handshake, CalendarDays, Banknote } from 'lucide-react'
import { useState } from 'react'
import { AdminOverview } from './AdminOverview'
import { AdminEstablishments } from './AdminEstablishments'
import { AdminBlog } from './AdminBlog'
import { AdminSubscribers } from './AdminSubscribers'
import { AdminSettings } from './AdminSettings'
import { AdminProspects } from './AdminProspects'
import { AdminPartners } from './AdminPartners'
import { AdminVisits } from './AdminVisits'
import { AdminCommissions } from './AdminCommissions'

type SubView = 'admin' | 'admin-stats' | 'admin-establishments' | 'admin-prospects' | 'admin-partners' | 'admin-visits' | 'admin-commissions' | 'admin-blog' | 'admin-subscribers' | 'admin-settings'

const navItems: { view: SubView; label: string; icon: React.ReactNode }[] = [
  { view: 'admin', label: 'Vue d\'ensemble', icon: <LayoutDashboard className="h-4 w-4" /> },
  { view: 'admin-establishments', label: 'Biens / Établissements', icon: <Building2 className="h-4 w-4" /> },
  { view: 'admin-prospects', label: 'Prospects', icon: <Users className="h-4 w-4" /> },
  { view: 'admin-partners', label: 'Partenaires & Mandats', icon: <Handshake className="h-4 w-4" /> },
  { view: 'admin-visits', label: 'Visites', icon: <CalendarDays className="h-4 w-4" /> },
  { view: 'admin-commissions', label: 'Commissions', icon: <Banknote className="h-4 w-4" /> },
  { view: 'admin-blog', label: 'Blog & Newsletter', icon: <Newspaper className="h-4 w-4" /> },
  { view: 'admin-settings', label: 'Paramètres', icon: <Settings className="h-4 w-4" /> },
]

interface SidebarContentProps {
  subView: SubView
  onNavigate: (view: View) => void
  onCloseMobile: () => void
}

function SidebarContent({ subView, onNavigate, onCloseMobile }: SidebarContentProps) {
  return (
    <div className="space-y-2 p-4">
      <div className="flex items-center gap-2 mb-4 px-2">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-primary">Admin</h2>
      </div>
      {navItems.map((item) => (
        <Button
          key={item.view}
          variant={subView === item.view ? 'secondary' : 'ghost'}
          className="w-full justify-start gap-3"
          onClick={() => { onNavigate(item.view as View); onCloseMobile() }}
        >
          {item.icon}
          {item.label}
        </Button>
      ))}
    </div>
  )
}

function MobileTabBar({ subView, onNavigate }: { subView: SubView; onNavigate: (view: View) => void }) {
  return (
    <nav className="md:hidden border-b bg-card px-3 pt-2">
      <div className="flex overflow-x-auto no-scrollbar whitespace-nowrap gap-2 pb-2">
        {navItems.map((item) => (
          <Button
            key={item.view}
            type="button"
            variant={subView === item.view ? 'secondary' : 'outline'}
            size="sm"
            className="shrink-0 gap-2"
            onClick={() => onNavigate(item.view as View)}
          >
            {item.icon}
            {item.label}
          </Button>
        ))}
      </div>
    </nav>
  )
}

const navLabels: Record<SubView, string> = {
  admin: 'Vue d\'ensemble',
  'admin-stats': 'Statistiques',
  'admin-establishments': 'Biens / Établissements',
  'admin-prospects': 'Prospects',
  'admin-partners': 'Partenaires & Mandats',
  'admin-visits': 'Visites',
  'admin-commissions': 'Commissions',
  'admin-blog': 'Blog & Newsletter',
  'admin-subscribers': 'Newsletter',
  'admin-settings': 'Paramètres',
}

export function AdminLayout() {
  const { currentView, navigate } = useAppStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const subView = currentView as SubView

  const renderContent = () => {
    switch (subView) {
      case 'admin-establishments':
        return <AdminEstablishments />
      case 'admin-prospects':
        return <AdminProspects />
      case 'admin-partners':
        return <AdminPartners />
      case 'admin-visits':
        return <AdminVisits />
      case 'admin-commissions':
        return <AdminCommissions />
      case 'admin-blog':
        return (
          <div className="space-y-8">
            <AdminBlog />
            <AdminSubscribers />
          </div>
        )
      case 'admin-subscribers':
        return <AdminSubscribers />
      case 'admin-settings':
        return <AdminSettings />
      case 'admin-stats':
      case 'admin':
      default:
        return <AdminOverview />
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <ScrollArea className="flex-1">
          <SidebarContent subView={subView} onNavigate={navigate} onCloseMobile={() => {}} />
        </ScrollArea>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 h-full bg-card border-r shadow-lg">
            <div className="absolute top-3 right-3">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-full">
              <SidebarContent subView={subView} onNavigate={navigate} onCloseMobile={() => setSidebarOpen(false)} />
            </ScrollArea>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-2 p-4 border-b bg-card">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold">
            {navLabels[subView] || 'Admin'}
          </h2>
        </div>
        <MobileTabBar subView={subView} onNavigate={navigate} />

        <ScrollArea className="h-[calc(100vh-13rem)] md:h-[calc(100vh-8rem)]">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            {renderContent()}
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}
