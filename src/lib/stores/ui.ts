import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UIState } from '@/types'

interface UIStore extends UIState {
  setTheme: (theme: 'dark' | 'light') => void
  toggleTheme: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setSearchOpen: (open: boolean) => void
  setModalOpen: (modal: string | null) => void
  closeAllModals: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: false,
      searchOpen: false,
      modalOpen: null,

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      setModalOpen: (modalOpen) => set({ modalOpen }),
      closeAllModals: () => set({ modalOpen: null, searchOpen: false }),
    }),
    {
      name: 'wallpaper-hub-ui',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
)
