// File: use-sidebar-toggle.ts

"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

interface SidebarToggleState {
  isOpen: boolean
  openMenus: Record<string, boolean>
}

interface SidebarToggleActions {
  setIsOpen: () => void
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
  toggleMenu: (menuLabel: string) => void
  setMenuOpen: (menuLabel: string, isOpen: boolean) => void
  isMenuOpen: (menuLabel: string) => boolean
}

type SidebarToggleStore = SidebarToggleState & SidebarToggleActions

export const useSidebarToggle = create<SidebarToggleStore>()(
  persist(
    immer((set, get) => ({
      isOpen: true,
      openMenus: {},
      setIsOpen: () =>
        set((state) => {
          state.isOpen = !state.isOpen
        }),
      toggleSidebar: () =>
        set((state) => {
          state.isOpen = !state.isOpen
        }),
      openSidebar: () =>
        set((state) => {
          state.isOpen = true
        }),
      closeSidebar: () =>
        set((state) => {
          state.isOpen = false
        }),
      toggleMenu: (menuLabel: string) =>
        set((state) => {
          state.openMenus[menuLabel] = !state.openMenus[menuLabel]
        }),
      setMenuOpen: (menuLabel: string, isOpen: boolean) =>
        set((state) => {
          if (state.openMenus[menuLabel] !== isOpen) {
            state.openMenus[menuLabel] = isOpen
          }
        }),
      isMenuOpen: (menuLabel: string) => get().openMenus[menuLabel] ?? false,
    })),
    {
      name: "sidebar-toggle",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isOpen: state.isOpen,
        openMenus: state.openMenus,
      }),
    },
  ),
)
