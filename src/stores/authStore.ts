import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser } from '../types';


interface AuthState {
  token: string | null;
  admin: AdminUser | null;
  isAuthenticated: boolean;
  login: (token: string, admin: AdminUser) => void;
  logout: () => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAuthenticated: false,
      
      login: (token, admin) => {
        localStorage.setItem('admin_token', token);
        set({ token, admin, isAuthenticated: true });
      },
      
      logout: () => {
        localStorage.removeItem('admin_token');
        set({ token: null, admin: null, isAuthenticated: false });
      },
      
      setToken: (token) => {
        if (token) {
          localStorage.setItem('admin_token', token);
          set({ token, isAuthenticated: true });
        } else {
          localStorage.removeItem('admin_token');
          set({ token: null, isAuthenticated: false });
        }
      }
    }),
    {
      name: 'toy-world-admin-auth',
    }
  )
);
