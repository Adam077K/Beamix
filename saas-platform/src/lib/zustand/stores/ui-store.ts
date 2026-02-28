// ================================================
// UI Store (Zustand)
// Purpose: Client-side UI state (modals, sidebar, etc.)
// ================================================

import { create } from 'zustand'

interface UIState {
  // Sidebar
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void

  // Modals
  activeModal: string | null
  openModal: (modalId: string) => void
  closeModal: () => void

  // Loading states (global)
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  loadingMessage: string | null
  setLoadingMessage: (message: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  // Sidebar state
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Modal state
  activeModal: null,
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),

  // Loading state
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  loadingMessage: null,
  setLoadingMessage: (message) => set({ loadingMessage: message }),
}))
