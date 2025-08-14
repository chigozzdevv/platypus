import { create } from 'zustand';
import type { User } from '@/types/auth';
import { authService } from '@/services/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  campJWT: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (walletAddress: string, campJWT: string) => Promise<{ isAdmin: boolean }>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

const initialToken = localStorage.getItem('auth_token');
const initialIsAdmin = localStorage.getItem('is_admin') === 'true';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: initialToken,
  campJWT: localStorage.getItem('camp_jwt'),
  isAuthenticated: !!initialToken,
  isAdmin: initialIsAdmin,
  isLoading: false,
  hasHydrated: !initialToken,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.userType === 'admin',
    }),

  setToken: (token) => {
    set({ token, isAuthenticated: !!token });
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  },

  login: async (walletAddress: string, campJWT: string) => {
    set({ isLoading: true });
    try {
      const response = await authService.connect({
        walletAddress,
        signature: '',
        message: '',
        originJWT: campJWT,
      });
      const isAdmin = response.user.userType === 'admin';
      set({
        user: response.user,
        token: response.token,
        campJWT,
        isAuthenticated: true,
        isAdmin,
        isLoading: false,
        hasHydrated: true,
      });
      localStorage.setItem('camp_jwt', campJWT);
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('is_admin', String(isAdmin));
      return { isAdmin };
    } catch (error) {
      set({ isLoading: false, hasHydrated: true });
      throw error;
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      campJWT: null,
      isAuthenticated: false,
      isAdmin: false,
      hasHydrated: true,
    });
    localStorage.removeItem('camp_jwt');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('camp_auth');
    authService.logout();
  },

  loadUser: async () => {
    const token = get().token;
    if (!token) {
      set({ hasHydrated: true });
      return;
    }
    set({ isLoading: true });
    try {
      const user = await authService.getProfile();
      const isAdmin = user.userType === 'admin';
      set({
        user,
        isLoading: false,
        isAdmin,
        isAuthenticated: true,
        hasHydrated: true,
      });
      localStorage.setItem('is_admin', String(isAdmin));
    } catch {
      get().logout();
      set({ isLoading: false, hasHydrated: true });
    }
  },
}));