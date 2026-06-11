import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token'),
  login: (user, token) => {
    localStorage.setItem('token', token);
    set({ isAuthenticated: true, user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ isAuthenticated: false, user: null, token: null });
  },
}));

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'dark', // Force dark mode default 
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    return { theme: newTheme };
  }),
}));

interface FilterState {
  dateFrom: string;
  dateTo: string;
  department: string;
  status: string;
  setFilters: (filters: Partial<FilterState>) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  dateFrom: '',
  dateTo: '',
  department: 'all',
  status: 'all',
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
}));
