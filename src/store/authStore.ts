import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export interface AuthUser {
  userId: string;
  role: string;
}

interface RoleDefinition {
  id: string;
  name: string;
  permissions: string[];
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  permissions: string[];
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setPermissions: (permissions: string[]) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      permissions: [],
      login: (token, user) => {
        set({ token, user });
        // Fetch permissions for the user's role after login
        axios
          .get<RoleDefinition[]>('http://localhost:3000/roles', {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            const roleDef = res.data.find((r) => r.name === user.role);
            set({ permissions: roleDef?.permissions ?? [] });
          })
          .catch(() => {
            // Fail gracefully — permissions remain empty
            set({ permissions: [] });
          });
      },
      logout: () => set({ token: null, user: null, permissions: [] }),
      setPermissions: (permissions) => set({ permissions }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, permissions: state.permissions }),
    }
  )
);
