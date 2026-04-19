import { create } from 'zustand';

export type View = 'home' | 'login' | 'register' | 'dashboard' | 'dashboard-hostel' | 'dashboard-rooms' | 'dashboard-bookings' | 'hostel-detail';

interface CurrentUser {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  phone: string | null;
}

interface AppState {
  currentView: View;
  currentUser: CurrentUser | null;
  selectedHostelId: string | null;
  isLoading: boolean;
  navigate: (view: View) => void;
  setUser: (user: CurrentUser | null) => void;
  logout: () => void;
  selectHostel: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'home',
  currentUser: null,
  selectedHostelId: null,
  isLoading: true,
  navigate: (view) => set({ currentView: view }),
  setUser: (user) => set({ currentUser: user, isLoading: false }),
  logout: () => set({ currentUser: null, currentView: 'home' }),
  selectHostel: (id) => set({ selectedHostelId: id, currentView: 'hostel-detail' }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
