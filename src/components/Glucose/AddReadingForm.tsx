import { useState } from 'react'
import { useGlucoseStore } from '@/stores/glucoseStore'
import { addGlucoseReading } from '@/services/glucoseService'
import { calculateInsulin } from '@/lib/utils'
import { useToastStore } from '@/stores/toastStore'

interface AddReadingFormProps {
  onClose?: () => void
}

export default function AddReadingForm({ onClose }: AddReadingFormProps) {
  const { addReading } = useGlucoseStore()
  const { addToast } = useToastStore()
  const [value, setValue] = useState('')
  const [unit, setUnit] = useState<'mg/dL' | 'mmol/L'>('mg/dL')
  const [notes, setNotes] = useState('')
  const [timestamp, setTimestamp] = useState(() => {
    const now = new Date()
    // Format as YYYY-MM-DDTHH:MM for datetime-local input
    const offset = now.getTimezoneOffset()
    const local = new Date(now.getTime() - offset * 60000)
    return local.toISOString().slice(0, 16)
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const numValue = Number(value)
    if (!value || isNaN(numValue) || numValue <= 0) {
      setError('Please enter a valid glucose value')
      return
    }

    setSaving(true)
    try {
      const glucoseInMgDl = unit === 'mmol/L' ? numValue * 18 : numValue
      const insulin = calculateInsulin(glucoseInMgDl)

      const reading = await addGlucoseReading({
        user_id: '', // filled by service
        value: numValue,
        unit,
        calculated_insulin: insulin,
        timestamp: new Date(timestamp).getTime(),
        notes: notes.trim() || undefined,
      })

      addReading(reading)
      addToast('Glucose reading saved')
      setValue('')
      setNotes('')
      onClose?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save reading')
    } finally {
      setSaving(false)
    }
  }

  const preview = value && !isNaN(Number(value)) && Number(value) > 0
    ? calculateInsulin(unit === 'mmol/L' ? Number(value) * 18 : Number(value))
    : null

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">Add Glucose Reading</h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="reading-value" className="block text-sm font-medium text-gray-700 mb-1">
            Glucose Value
          </label>
          <input
            id="reading-value"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 120"
            step="0.1"
            min="0"
            required
            autoFocus
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="reading-unit" className="block text-sm font-medium text-gray-700 mb-1">
            Unit
          </label>
          <select
            id="reading-unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as 'mg/dL' | 'mmol/L')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="mg/dL">mg/dL</option>
            <option value="mmol/L">mmol/L</option>
          </select>
        </div>
      </div>

      {preview !== null && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm">
          Calculated insulin: <span className="font-bold text-indigo-600">{preview.toFixed(1)} units</span>
        </div>
      )}

      <div>
        <label htmlFor="reading-time" className="block text-sm font-medium text-gray-700 mb-1">
          Date & Time
        </label>
        <input
          id="reading-time"
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="reading-notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <input
          id="reading-notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Before lunch, fasting..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Reading'}
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
