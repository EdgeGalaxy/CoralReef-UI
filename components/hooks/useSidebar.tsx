import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarStore {
  isMinimized: boolean;
  toggle: () => void;
}

export const useSidebar = create<SidebarStore>()(
  persist(
    (set) => ({
      isMinimized: false,
      toggle: () => set((state) => ({ isMinimized: !state.isMinimized }))
    }),
    {
      name: 'sidebar-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({ isMinimized: state.isMinimized })
    }
  )
);
