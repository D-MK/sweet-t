import { create } from 'zustand'
import type { AuthState } from '@/types'

interface AuthStore extends AuthState {
  setUser: (user: any) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
}

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,
  setUser: (user) => set({ user, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}))
