'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Home, LogIn, UserPlus, LayoutDashboard, LogOut, Menu, Building2 } from 'lucide-react';

export default function Navbar() {
  const { currentUser, navigate, logout, currentView } = useAppStore();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
  };

  const NavLinks = () => (
    <>
      <Button
        variant={currentView === 'home' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => { navigate('home'); setOpen(false); }}
        className="gap-2"
      >
        <Home className="h-4 w-4" />
        Accueil
      </Button>

      {currentUser ? (
        <>
          <Button
            variant={currentView.startsWith('dashboard') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => { navigate('dashboard'); setOpen(false); }}
            className="gap-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </>
      ) : (
        <>
          <Button
            variant={currentView === 'login' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => { navigate('login'); setOpen(false); }}
            className="gap-2"
          >
            <LogIn className="h-4 w-4" />
            Connexion
          </Button>
          <Button
            variant={currentView === 'register' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => { navigate('register'); setOpen(false); }}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            S&apos;inscrire
          </Button>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Auberge<span className="text-primary">Connect</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLinks />
        </nav>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <div className="flex flex-col gap-3 mt-8">
              <NavLinks />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
