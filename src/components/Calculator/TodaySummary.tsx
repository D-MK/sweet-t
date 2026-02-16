import { useMemo } from 'react'
import { formatDate } from '@/lib/utils'
import { useGlucoseStore } from '@/stores/glucoseStore'
import { useFoodStore } from '@/stores/foodStore'
import { useInsulinStore } from '@/stores/insulinStore'

export default function TodaySummary() {
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()

  const { readings } = useGlucoseStore()
  const { entries } = useFoodStore()
  const { doses } = useInsulinStore()

  const totalReadings = useMemo(
    () => readings.filter((r) => r.timestamp >= startOfDay).length,
    [readings, startOfDay],
  )
  const totalInsulin = useMemo(
    () => doses.filter((d) => d.timestamp >= startOfDay).reduce((sum, d) => sum + d.units, 0),
    [doses, startOfDay],
  )
  const totalCarbs = useMemo(
    () => entries.filter((e) => e.timestamp >= startOfDay).reduce((sum, e) => sum + (e.carbs_grams ?? e.bread_units * 12), 0),
    [entries, startOfDay],
  )

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Today's Summary</h2>
      <p className="text-gray-500 text-sm mb-4">{formatDate(today.getTime())}</p>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-1">Glucose Readings</p>
          <p className="text-2xl font-bold text-indigo-600">{totalReadings}</p>
        </div>

        <div className="text-center">
          <p className="text-gray-600 text-sm mb-1">Total Insulin</p>
          <p className="text-2xl font-bold text-indigo-600">{totalInsulin}</p>
          <p className="text-xs text-gray-500">units</p>
        </div>

        <div className="text-center">
          <p className="text-gray-600 text-sm mb-1">Carbs</p>
          <p className="text-2xl font-bold text-indigo-600">{totalCarbs}</p>
          <p className="text-xs text-gray-500">g</p>
        </div>
      </div>
    </div>
  )
}
