import { create } from 'zustand'
import type { Profile, SupabaseSession } from '@/types'

interface AuthStore {
  user: Profile | null
  session: SupabaseSession | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: Profile | null) => void
  setSession: (session: SupabaseSession | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

const initialState = {
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
}

export const useAuthStore = create<AuthStore>()((set) => ({
  ...initialState,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setSession: (session) =>
    set({
      session,
    }),

  setLoading: (isLoading) =>
    set({
      isLoading,
    }),

  reset: () => set(initialState),
}))
