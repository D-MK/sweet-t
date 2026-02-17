import { useState, useMemo } from 'react'
import { useInsulinStore } from '@/stores/insulinStore'
import AddDoseForm from './AddDoseForm'
import DoseCard from './DoseCard'
import { formatDate } from '@/lib/utils'

type DateFilter = 'today' | '7d' | '30d' | 'all'

export default function DoseLog() {
  const { doses } = useInsulinStore()
  const [showForm, setShowForm] = useState(false)
  const [dateFilter, setDateFilter] = useState<DateFilter>('7d')

  const now = Date.now()

  const filteredDoses = useMemo(() => {
    const cutoff = {
      today: now - 24 * 60 * 60 * 1000,
      '7d': now - 7 * 24 * 60 * 60 * 1000,
      '30d': now - 30 * 24 * 60 * 60 * 1000,
      all: 0,
    }[dateFilter]

    return doses
      .filter((d) => d.timestamp >= cutoff)
      .sort((a, b) => b.timestamp - a.timestamp)
  }, [doses, dateFilter, now])

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filteredDoses> = {}
    for (const dose of filteredDoses) {
      const dateKey = formatDate(dose.timestamp)
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(dose)
    }
    return Object.entries(groups)
  }, [filteredDoses])

  // Today's summary by type
  const todayDoses = useMemo(() => {
    const todayCutoff = now - 24 * 60 * 60 * 1000
    return doses.filter((d) => d.timestamp >= todayCutoff)
  }, [doses, now])

  const todayRapid = todayDoses.filter((d) => d.insulin_type === 'rapid').reduce((sum, d) => sum + d.units, 0)
  const todayLong = todayDoses.filter((d) => d.insulin_type === 'long').reduce((sum, d) => sum + d.units, 0)
  const todayTotal = todayDoses.reduce((sum, d) => sum + d.units, 0)

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
        <h2 className="text-xl font-semibold text-gray-900">Insulin Tracker</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
        >
          {showForm ? 'Close' : '+ Log Dose'}
        </button>
      </div>

      {/* Add dose form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <AddDoseForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Today's summary */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Today's Insulin</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{todayRapid.toFixed(1)}</p>
            <p className="text-xs text-gray-500">Rapid (u)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{todayLong.toFixed(1)}</p>
            <p className="text-xs text-gray-500">Long (u)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600">{todayTotal.toFixed(1)}</p>
            <p className="text-xs text-gray-500">Total (u)</p>
          </div>
        </div>
      </div>

      {/* Date filter */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setDateFilter(f.id)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              dateFilter === f.id
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-500 self-center">
          {filteredDoses.length} dose{filteredDoses.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Dose log grouped by date */}
      {grouped.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500 mb-2">No insulin doses logged yet</p>
          <p className="text-gray-400 text-sm">
            Tap "+ Log Dose" above to record your first insulin dose.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, dayDoses]) => {
            const dayTotal = dayDoses.reduce((sum, d) => sum + d.units, 0)
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500">{date}</h3>
                  <span className="text-xs text-gray-400">{dayTotal.toFixed(1)}u total</span>
                </div>
                <div className="space-y-2">
                  {dayDoses.map((dose) => (
                    <DoseCard key={dose.id} dose={dose} />
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
