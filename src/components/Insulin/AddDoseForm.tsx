import { useState } from 'react'
import { useInsulinStore } from '@/stores/insulinStore'
import { useGlucoseStore } from '@/stores/glucoseStore'
import { addInsulinDose } from '@/services/insulinService'
import { formatDateTime } from '@/lib/utils'

interface AddDoseFormProps {
  onClose?: () => void
}

export default function AddDoseForm({ onClose }: AddDoseFormProps) {
  const { addDose } = useInsulinStore()
  const { readings } = useGlucoseStore()
  const [units, setUnits] = useState('')
  const [insulinType, setInsulinType] = useState<'rapid' | 'long' | 'mixed'>('rapid')
  const [linkedReadingId, setLinkedReadingId] = useState('')
  const [notes, setNotes] = useState('')
  const [timestamp, setTimestamp] = useState(() => {
    const now = new Date()
    const offset = now.getTimezoneOffset()
    const local = new Date(now.getTime() - offset * 60000)
    return local.toISOString().slice(0, 16)
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Recent readings for linking (last 24 hours)
  const recentReadings = readings
    .filter((r) => r.timestamp > Date.now() - 24 * 60 * 60 * 1000)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const numUnits = Number(units)
    if (!units || isNaN(numUnits) || numUnits <= 0) {
      setError('Please enter a valid number of units')
      return
    }

    setSaving(true)
    try {
      const dose = await addInsulinDose({
        user_id: '',
        units: numUnits,
        insulin_type: insulinType,
        timestamp: new Date(timestamp).getTime(),
        linked_reading_id: linkedReadingId || undefined,
        notes: notes.trim() || undefined,
      })

      addDose(dose)
      setUnits('')
      setNotes('')
      setLinkedReadingId('')
      onClose?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save insulin dose')
    } finally {
      setSaving(false)
    }
  }

  const typeOptions: { value: 'rapid' | 'long' | 'mixed'; label: string; desc: string; color: string }[] = [
    { value: 'rapid', label: 'Rapid', desc: 'Mealtime', color: 'border-blue-400 bg-blue-50 text-blue-800' },
    { value: 'long', label: 'Long', desc: 'Basal', color: 'border-purple-400 bg-purple-50 text-purple-800' },
    { value: 'mixed', label: 'Mixed', desc: 'Combination', color: 'border-teal-400 bg-teal-50 text-teal-800' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">Log Insulin Dose</h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Insulin type selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Insulin Type</label>
        <div className="grid grid-cols-3 gap-2">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setInsulinType(opt.value)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                insulinType === opt.value
                  ? opt.color + ' ring-2 ring-offset-1 ring-current'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <p className="text-sm font-semibold">{opt.label}</p>
              <p className="text-xs opacity-75">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Units */}
      <div>
        <label htmlFor="dose-units" className="block text-sm font-medium text-gray-700 mb-1">
          Units
        </label>
        <input
          id="dose-units"
          type="number"
          value={units}
          onChange={(e) => setUnits(e.target.value)}
          placeholder="e.g. 4"
          step="0.5"
          min="0.5"
          required
          autoFocus
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Linked reading */}
      {recentReadings.length > 0 && (
        <div>
          <label htmlFor="dose-linked" className="block text-sm font-medium text-gray-700 mb-1">
            Link to reading <span className="text-gray-400 font-normal">optional</span>
          </label>
          <select
            id="dose-linked"
            value={linkedReadingId}
            onChange={(e) => setLinkedReadingId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">No linked reading</option>
            {recentReadings.map((r) => (
              <option key={r.id} value={r.id}>
                {r.value} {r.unit} - {formatDateTime(r.timestamp)}
                {r.calculated_insulin != null ? ` (calc: ${r.calculated_insulin.toFixed(1)}u)` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Timestamp */}
      <div>
        <label htmlFor="dose-time" className="block text-sm font-medium text-gray-700 mb-1">
          Date & Time
        </label>
        <input
          id="dose-time"
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="dose-notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <input
          id="dose-notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Before dinner, correction dose..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Dose'}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
