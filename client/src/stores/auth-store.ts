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
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (walletAddress: string, campJWT: string) => Promise<{ isAdmin: boolean }>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  campJWT: localStorage.getItem('camp_jwt'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isAdmin: false,
  isLoading: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.userType === 'admin',
    }),

  setToken: (token) => {
    set({ token, isAuthenticated: !!token });
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
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
      });

      localStorage.setItem('camp_jwt', campJWT);
      localStorage.setItem('auth_token', response.token);

      return { isAdmin };
    } catch (error) {
      set({ isLoading: false });
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
    });

    localStorage.removeItem('camp_jwt');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('camp_auth');

    authService.logout();
  },

  loadUser: async () => {
    const token = get().token;
    if (!token) return;
    set({ isLoading: true });
    try {
      const user = await authService.getProfile();
      set({
        user,
        isLoading: false,
        isAdmin: user.userType === 'admin',
        isAuthenticated: true,
      });
    } catch {
      get().logout();
      set({ isLoading: false });
    }
  },
}));
