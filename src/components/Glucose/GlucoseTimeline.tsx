import { useState, useMemo } from 'react'
import { useGlucoseStore } from '@/stores/glucoseStore'
import AddReadingForm from './AddReadingForm'
import ReadingCard from './ReadingCard'
import GlucoseChart from './GlucoseChart'
import { formatDate } from '@/lib/utils'

type DateFilter = 'today' | '7d' | '30d' | 'all'

export default function GlucoseTimeline() {
  const { readings } = useGlucoseStore()
  const [showForm, setShowForm] = useState(false)
  const [dateFilter, setDateFilter] = useState<DateFilter>('7d')

  const now = Date.now()

  const filteredReadings = useMemo(() => {
    const cutoff = {
      today: now - 24 * 60 * 60 * 1000,
      '7d': now - 7 * 24 * 60 * 60 * 1000,
      '30d': now - 30 * 24 * 60 * 60 * 1000,
      all: 0,
    }[dateFilter]

    return readings
      .filter((r) => r.timestamp >= cutoff)
      .sort((a, b) => b.timestamp - a.timestamp)
  }, [readings, dateFilter, now])

  // Group readings by date for display
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filteredReadings> = {}
    for (const reading of filteredReadings) {
      const dateKey = formatDate(reading.timestamp)
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(reading)
    }
    return Object.entries(groups)
  }, [filteredReadings])

  const filters: { id: DateFilter; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: 'all', label: 'All' },
  ]

  return (
    <div className="space-y-6">
      {/* Header with add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Glucose Readings</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          {showForm ? 'Close' : '+ Add Reading'}
        </button>
      </div>

      {/* Add reading form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <AddReadingForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Chart */}
      {filteredReadings.length > 0 && (
        <GlucoseChart readings={filteredReadings} />
      )}

      {/* Date filter */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setDateFilter(f.id)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              dateFilter === f.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-500 self-center">
          {filteredReadings.length} reading{filteredReadings.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Timeline grouped by date */}
      {grouped.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500 mb-2">No glucose readings yet</p>
          <p className="text-gray-400 text-sm">
            Use the calculator on the Home tab or tap "+ Add Reading" above to log your first reading.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, dayReadings]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-gray-500 mb-2">{date}</h3>
              <div className="space-y-2">
                {dayReadings.map((reading) => (
                  <ReadingCard key={reading.id} reading={reading} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
