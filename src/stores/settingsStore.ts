import { create } from 'zustand'
import type { UserSettings } from '@/types'

interface SettingsStore {
  settings: UserSettings | null
  setSettings: (settings: UserSettings | null) => void
  updateSettings: (partial: Partial<UserSettings>) => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  setSettings: (settings) => set({ settings }),
  updateSettings: (partial) =>
    set((state) => ({
      settings: state.settings ? { ...state.settings, ...partial } : null,
    })),
}))
