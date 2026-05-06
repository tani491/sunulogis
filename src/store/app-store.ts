import { startTransition } from 'react';
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
  | 'admin-commissions'
  | 'admin-settings'
  | 'admin-analytics'
  | 'admin-subscription-requests';

interface CurrentUser {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  phone: string | null;
  isSubscribed: boolean;
}

interface SearchFilters {
  search: string;
  region: string;
  priceRange: string;
  type: string;
}

interface AppState {
  currentView: View;
  viewHistory: View[];
  currentUser: CurrentUser | null;
  currentEstablishmentId: string | null;
  currentBlogSlug: string | null;
  searchFilters: SearchFilters;
  isLoading: boolean;
  navigate: (view: View) => void;
  goBack: () => void;
  canGoBack: () => boolean;
  setUser: (user: CurrentUser | null) => void;
  logout: () => void;
  selectEstablishment: (id: string) => void;
  selectBlogPost: (slug: string) => void;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  setLoading: (loading: boolean) => void;
}

const MAX_HISTORY = 20;

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'landing',
  viewHistory: [],
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
  navigate: (view) =>
    startTransition(() =>
      set((state) => {
        if (state.currentView === view) return state;
        const next = [...state.viewHistory, state.currentView];
        const trimmed = next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
        return { currentView: view, viewHistory: trimmed };
      })
    ),
  goBack: () =>
    startTransition(() =>
      set((state) => {
        if (state.viewHistory.length === 0) return state;
        const previous = state.viewHistory[state.viewHistory.length - 1];
        return {
          currentView: previous,
          viewHistory: state.viewHistory.slice(0, -1),
        };
      })
    ),
  canGoBack: () => get().viewHistory.length > 0,
  setUser: (user) => set({ currentUser: user, isLoading: false }),
  logout: () => startTransition(() => set({ currentUser: null, currentView: 'landing', viewHistory: [] })),
  selectEstablishment: (id) =>
    startTransition(() =>
      set((state) => ({
        currentEstablishmentId: id,
        currentView: 'establishment-detail',
        viewHistory: [...state.viewHistory, state.currentView].slice(-MAX_HISTORY),
      }))
    ),
  selectBlogPost: (slug) =>
    startTransition(() =>
      set((state) => ({
        currentBlogSlug: slug,
        currentView: 'blog-post',
        viewHistory: [...state.viewHistory, state.currentView].slice(-MAX_HISTORY),
      }))
    ),
  setSearchFilters: (filters) => set((state) => ({
    searchFilters: { ...state.searchFilters, ...filters },
  })),
  setLoading: (loading) => set({ isLoading: loading }),
}));
