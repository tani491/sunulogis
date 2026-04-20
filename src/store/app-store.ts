import { create } from 'zustand';

export type View =
  | 'home'
  | 'landing'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'dashboard-establishments'
  | 'dashboard-rooms'
  | 'dashboard-bookings'
  | 'establishment-detail'
  | 'blog'
  | 'blog-post'
  | 'admin'
  | 'admin-stats'
  | 'admin-establishments'
  | 'admin-users'
  | 'admin-blog'
  | 'admin-subscribers'
  | 'admin-commissions';

interface CurrentUser {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  phone: string | null;
}

interface SearchFilters {
  search: string;
  region: string;
  priceRange: string;
  type: string;
}

interface AppState {
  currentView: View;
  currentUser: CurrentUser | null;
  currentEstablishmentId: string | null;
  currentBlogSlug: string | null;
  searchFilters: SearchFilters;
  isLoading: boolean;
  navigate: (view: View) => void;
  setUser: (user: CurrentUser | null) => void;
  logout: () => void;
  selectEstablishment: (id: string) => void;
  selectBlogPost: (slug: string) => void;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'landing',
  currentUser: null,
  currentEstablishmentId: null,
  currentBlogSlug: null,
  searchFilters: {
    search: '',
    region: 'all',
    priceRange: 'all',
    type: 'all',
  },
  isLoading: true,
  navigate: (view) => set({ currentView: view }),
  setUser: (user) => set({ currentUser: user, isLoading: false }),
  logout: () => set({ currentUser: null, currentView: 'landing' }),
  selectEstablishment: (id) => set({ currentEstablishmentId: id, currentView: 'establishment-detail' }),
  selectBlogPost: (slug) => set({ currentBlogSlug: slug, currentView: 'blog-post' }),
  setSearchFilters: (filters) => set((state) => ({
    searchFilters: { ...state.searchFilters, ...filters },
  })),
  setLoading: (loading) => set({ isLoading: loading }),
}));
