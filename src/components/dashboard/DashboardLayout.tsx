'use client'

import { useAppStore, type View } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LayoutDashboard, Building2, BedDouble, CalendarDays, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { DashboardOverview } from './DashboardOverview'
import { ManageHostel } from './ManageHostel'
import { ManageRooms } from './ManageRooms'
import { ManageBookings } from './ManageBookings'

type SubView = 'dashboard' | 'dashboard-hostel' | 'dashboard-rooms' | 'dashboard-bookings'

interface SidebarContentProps {
  subView: SubView
  onNavigate: (view: View) => void
  onCloseMobile: () => void
}

function SidebarContent({ subView, onNavigate, onCloseMobile }: SidebarContentProps) {
  const navItems: { view: SubView; label: string; icon: React.ReactNode }[] = [
    { view: 'dashboard', label: 'Vue d\'ensemble', icon: <LayoutDashboard className="h-4 w-4" /> },
    { view: 'dashboard-hostel', label: 'Mon Auberge', icon: <Building2 className="h-4 w-4" /> },
    { view: 'dashboard-rooms', label: 'Chambres', icon: <BedDouble className="h-4 w-4" /> },
    { view: 'dashboard-bookings', label: 'Réservations', icon: <CalendarDays className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-2 p-4">
      <h2 className="text-lg font-bold text-primary mb-4 px-2">Dashboard</h2>
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

const navLabels: Record<SubView, string> = {
  dashboard: 'Vue d\'ensemble',
  'dashboard-hostel': 'Mon Auberge',
  'dashboard-rooms': 'Chambres',
  'dashboard-bookings': 'Réservations',
}

export function DashboardLayout() {
  const { currentView, navigate } = useAppStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const subView = currentView as SubView

  const renderContent = () => {
    switch (subView) {
      case 'dashboard-hostel':
        return <ManageHostel />
      case 'dashboard-rooms':
        return <ManageRooms />
      case 'dashboard-bookings':
        return <ManageBookings />
      default:
        return <DashboardOverview />
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
      <main className="flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-2 p-4 border-b bg-card">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold">
            {navLabels[subView] || 'Dashboard'}
          </h2>
        </div>

        <ScrollArea className="h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]">
          <div className="p-4 md:p-6 lg:p-8">
            {renderContent()}
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}
