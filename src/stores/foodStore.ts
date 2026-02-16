import { create } from 'zustand'
import type { FoodEntry } from '@/types'

interface FoodStore {
  entries: FoodEntry[]
  setEntries: (entries: FoodEntry[]) => void
  addEntry: (entry: FoodEntry) => void
  updateEntry: (id: string, entry: FoodEntry) => void
  deleteEntry: (id: string) => void
}

export const useFoodStore = create<FoodStore>((set) => ({
  entries: [],
  setEntries: (entries) => set({ entries }),
  addEntry: (entry) =>
    set((state) => ({
      entries: [entry, ...state.entries],
    })),
  updateEntry: (id, entry) =>
    set((state) => ({
      entries: state.entries.map((e) => (e.id === id ? entry : e)),
    })),
  deleteEntry: (id) =>
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    })),
}))
