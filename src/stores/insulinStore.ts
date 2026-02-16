import { create } from 'zustand'
import type { InsulinDose } from '@/types'

interface InsulinStore {
  doses: InsulinDose[]
  setDoses: (doses: InsulinDose[]) => void
  addDose: (dose: InsulinDose) => void
  updateDose: (id: string, dose: InsulinDose) => void
  deleteDose: (id: string) => void
}

export const useInsulinStore = create<InsulinStore>((set) => ({
  doses: [],
  setDoses: (doses) => set({ doses }),
  addDose: (dose) =>
    set((state) => ({
      doses: [dose, ...state.doses],
    })),
  updateDose: (id, dose) =>
    set((state) => ({
      doses: state.doses.map((d) => (d.id === id ? dose : d)),
    })),
  deleteDose: (id) =>
    set((state) => ({
      doses: state.doses.filter((d) => d.id !== id),
    })),
}))
