import { create } from 'zustand'
import type { GlucoseReading } from '@/types'

interface GlucoseStore {
  readings: GlucoseReading[]
  setReadings: (readings: GlucoseReading[]) => void
  addReading: (reading: GlucoseReading) => void
  updateReading: (id: string, reading: GlucoseReading) => void
  deleteReading: (id: string) => void
}

export const useGlucoseStore = create<GlucoseStore>((set) => ({
  readings: [],
  setReadings: (readings) => set({ readings }),
  addReading: (reading) =>
    set((state) => ({
      readings: [reading, ...state.readings],
    })),
  updateReading: (id, reading) =>
    set((state) => ({
      readings: state.readings.map((r) => (r.id === id ? reading : r)),
    })),
  deleteReading: (id) =>
    set((state) => ({
      readings: state.readings.filter((r) => r.id !== id),
    })),
}))
