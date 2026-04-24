import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  role: 'user' | 'priest' | 'admin';
  name: { first: string; last: string };
  avatar?: string;
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  setAccessToken: (token: string | null) => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    login: (user, accessToken): void =>
      set({
        user,
        accessToken,
        isAuthenticated: true,
      }),
    logout: (): void =>
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      }),
    setAccessToken: (accessToken): void => set({ accessToken }),
    updateUser: (userData): void =>
      set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null,
      })),
  }))
);
