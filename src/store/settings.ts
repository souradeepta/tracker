import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  dark: boolean;
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  toggleDark: () => void;
  setSidebarWidth: (w: number) => void;
  toggleSidebarCollapsed: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      dark: false,
      sidebarWidth: 240,
      sidebarCollapsed: false,
      toggleDark: () =>
        set((state) => {
          const next = !state.dark;
          document.documentElement.classList.toggle("dark", next);
          return { dark: next };
        }),
      setSidebarWidth: (w) => set({ sidebarWidth: Math.min(480, Math.max(160, w)) }),
      toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    { name: "notion-clone-settings" }
  )
);
