import { useState, useMemo } from 'react'
import { useFoodStore } from '@/stores/foodStore'
import AddFoodForm from './AddFoodForm'
import FoodPresets from './FoodPresets'
import FoodCard from './FoodCard'
import { formatDate } from '@/lib/utils'

type DateFilter = 'today' | '7d' | '30d' | 'all'

export default function FoodLog() {
  const { entries } = useFoodStore()
  const [showForm, setShowForm] = useState(false)
  const [dateFilter, setDateFilter] = useState<DateFilter>('7d')

  const now = Date.now()

  const filteredEntries = useMemo(() => {
    const cutoff = {
      today: now - 24 * 60 * 60 * 1000,
      '7d': now - 7 * 24 * 60 * 60 * 1000,
      '30d': now - 30 * 24 * 60 * 60 * 1000,
      all: 0,
    }[dateFilter]

    return entries
      .filter((e) => e.timestamp >= cutoff)
      .sort((a, b) => b.timestamp - a.timestamp)
  }, [entries, dateFilter, now])

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filteredEntries> = {}
    for (const entry of filteredEntries) {
      const dateKey = formatDate(entry.timestamp)
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(entry)
    }
    return Object.entries(groups)
  }, [filteredEntries])

  // Daily totals for the summary
  const todayEntries = useMemo(() => {
    const todayCutoff = now - 24 * 60 * 60 * 1000
    return entries.filter((e) => e.timestamp >= todayCutoff)
  }, [entries, now])

  const todayTotalBU = todayEntries.reduce((sum, e) => sum + e.bread_units, 0)
  const todayTotalCarbs = todayEntries.reduce((sum, e) => sum + (e.carbs_grams ?? e.bread_units * 12), 0)

  const filters: { id: DateFilter; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: 'all', label: 'All' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Food Tracker</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
        >
          {showForm ? 'Close' : '+ Add Food'}
        </button>
      </div>

      {/* Add food form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <AddFoodForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Today's summary */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Today's Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-orange-600">{todayTotalBU.toFixed(1)}</p>
            <p className="text-xs text-gray-500">Bread Units</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">{todayTotalCarbs.toFixed(0)}g</p>
            <p className="text-xs text-gray-500">Carbs</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">{todayEntries.length}</p>
            <p className="text-xs text-gray-500">Meals</p>
          </div>
        </div>
      </div>

      {/* Quick presets */}
      <div className="bg-white rounded-lg shadow p-4">
        <FoodPresets />
      </div>

      {/* Date filter */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setDateFilter(f.id)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              dateFilter === f.id
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-500 self-center">
          {filteredEntries.length} entr{filteredEntries.length !== 1 ? 'ies' : 'y'}
        </span>
      </div>

      {/* Food log grouped by date */}
      {grouped.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500 mb-2">No food entries yet</p>
          <p className="text-gray-400 text-sm">
            Use the quick presets above or tap "+ Add Food" to log your first meal.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, dayEntries]) => {
            const dayBU = dayEntries.reduce((sum, e) => sum + e.bread_units, 0)
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">{date}</h3>
                  <span className="text-xs text-gray-400">{dayBU.toFixed(1)} BU total</span>
                </div>
                <div className="space-y-2">
                  {dayEntries.map((entry) => (
                    <FoodCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
