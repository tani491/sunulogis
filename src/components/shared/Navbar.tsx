'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Home, LayoutDashboard, LogOut, Menu, Building2, Search, MapPin, Banknote, ChevronDown, User, Shield } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const regions = [
  'Dakar', 'Diourbel', 'Fatick', 'Kaffrine', 'Kaolack',
  'Kédougou', 'Kolda', 'Louga', 'Matam', 'Sédhiou',
  'Saint-Louis', 'Tambacounda', 'Thiès', 'Ziguinchor',
];

export default function Navbar() {
  const { currentUser, navigate, logout, currentView, searchFilters, setSearchFilters } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    setShowUserMenu(false);
  };

  const isPublicPage = currentView === 'landing' || currentView === 'home' || currentView === 'establishment-detail';

  const handleSearch = () => {
    navigate('home');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button
          onClick={() => navigate(currentUser ? (currentUser.role === 'admin' ? 'admin' : 'dashboard') : 'landing')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Sunu<span className="text-primary">Logis</span>
          </span>
        </button>

        {/* Desktop: Search filters (only on public pages) */}
        {isPublicPage && (
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-2xl mx-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un établissement..."
                value={searchFilters.search}
                onChange={(e) => setSearchFilters({ search: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9 h-9"
              />
            </div>
            <Select value={searchFilters.region} onValueChange={(v) => { setSearchFilters({ region: v }); handleSearch(); }}>
              <SelectTrigger className="w-40 h-9">
                <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les régions</SelectItem>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={searchFilters.priceRange} onValueChange={(v) => { setSearchFilters({ priceRange: v }); handleSearch(); }}>
              <SelectTrigger className="w-44 h-9">
                <Banknote className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les prix</SelectItem>
                <SelectItem value="0-10000">0 - 10 000 FCFA</SelectItem>
                <SelectItem value="10000-25000">10 000 - 25 000 FCFA</SelectItem>
                <SelectItem value="25000-50000">25 000 - 50 000 FCFA</SelectItem>
                <SelectItem value="50000-100000">50 000 - 100 000 FCFA</SelectItem>
                <SelectItem value="100000+">100 000+ FCFA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Desktop: User menu */}
        <div className="hidden md:flex items-center gap-2">
          {currentUser ? (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="max-w-[120px] truncate">{currentUser.fullName || currentUser.email}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border bg-card shadow-lg z-50">
                    <div className="p-3 border-b">
                      <p className="font-medium text-sm truncate">{currentUser.fullName || currentUser.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                      <p className="text-xs text-primary mt-1 capitalize">{currentUser.role}</p>
                    </div>
                    <div className="p-1">
                      {currentUser.role === 'admin' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2"
                          onClick={() => { navigate('admin'); setShowUserMenu(false); }}
                        >
                          <Shield className="h-4 w-4" />
                          Panel Admin
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2"
                          onClick={() => { navigate('dashboard'); setShowUserMenu(false); }}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Espace Gestion
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('home')}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Explorer
              </Button>
            </div>
          )}
        </div>

        {/* Mobile: Menu button */}
        <div className="flex md:hidden items-center gap-2">
          {isPublicPage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <VisuallyHidden>
                <SheetTitle>Menu de navigation SunuLogis</SheetTitle>
              </VisuallyHidden>
              <div className="flex flex-col gap-3 mt-8">
                {currentUser ? (
                  <>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="font-medium text-sm">{currentUser.fullName || currentUser.email}</p>
                      <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                    </div>
                    {currentUser.role === 'admin' ? (
                      <Button
                        variant={currentView.startsWith('admin') ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => { navigate('admin'); setMobileOpen(false); }}
                      >
                        <Shield className="h-4 w-4" />
                        Panel Admin
                      </Button>
                    ) : (
                      <Button
                        variant={currentView.startsWith('dashboard') ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => { navigate('dashboard'); setMobileOpen(false); }}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Espace Gestion
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => { navigate('home'); setMobileOpen(false); }}
                    >
                      <Home className="h-4 w-4" />
                      Explorer
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile: Search filters dropdown */}
      {isPublicPage && showFilters && (
        <div className="md:hidden border-t bg-card/95 backdrop-blur-md px-4 py-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un établissement..."
              value={searchFilters.search}
              onChange={(e) => setSearchFilters({ search: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={searchFilters.region} onValueChange={(v) => { setSearchFilters({ region: v }); handleSearch(); }}>
              <SelectTrigger className="flex-1 h-9">
                <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={searchFilters.priceRange} onValueChange={(v) => { setSearchFilters({ priceRange: v }); handleSearch(); }}>
              <SelectTrigger className="flex-1 h-9">
                <Banknote className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="0-10000">0-10K</SelectItem>
                <SelectItem value="10000-25000">10K-25K</SelectItem>
                <SelectItem value="25000-50000">25K-50K</SelectItem>
                <SelectItem value="50000-100000">50K-100K</SelectItem>
                <SelectItem value="100000+">100K+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </header>
  );
}
