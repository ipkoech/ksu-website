"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleMobile: () => void;
  setMobileOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isMobileOpen: false,
      toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
      toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
      setMobileOpen: (open) => set({ isMobileOpen: open }),
    }),
    {
      name: "ksu-sidebar",
    }
  )
);

export function useSidebar() {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const isMobileOpen = useSidebarStore((state) => state.isMobileOpen);
  const toggle = useSidebarStore((state) => state.toggle);
  const setCollapsed = useSidebarStore((state) => state.setCollapsed);
  const toggleMobile = useSidebarStore((state) => state.toggleMobile);
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen);

  return {
    isCollapsed,
    isMobileOpen,
    toggle,
    setCollapsed,
    toggleMobile,
    setMobileOpen,
  };
}