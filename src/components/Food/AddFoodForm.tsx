import { useState } from 'react'
import { useFoodStore } from '@/stores/foodStore'
import { addFoodEntry } from '@/services/foodService'
import { useToastStore } from '@/stores/toastStore'

interface AddFoodFormProps {
  onClose?: () => void
}

export default function AddFoodForm({ onClose }: AddFoodFormProps) {
  const { addEntry } = useFoodStore()
  const { addToast } = useToastStore()
  const [breadUnits, setBreadUnits] = useState('')
  const [carbsGrams, setCarbsGrams] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [timestamp, setTimestamp] = useState(() => {
    const now = new Date()
    const offset = now.getTimezoneOffset()
    const local = new Date(now.getTime() - offset * 60000)
    return local.toISOString().slice(0, 16)
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const buValue = Number(breadUnits)
    if (!breadUnits || isNaN(buValue) || buValue < 0) {
      setError('Please enter a valid bread unit value')
      return
    }

    setSaving(true)
    try {
      const entry = await addFoodEntry({
        user_id: '',
        bread_units: buValue,
        carbs_grams: carbsGrams ? Number(carbsGrams) : undefined,
        description: description.trim() || undefined,
        timestamp: new Date(timestamp).getTime(),
        notes: notes.trim() || undefined,
      })

      addEntry(entry)
      addToast('Food entry saved')
      setBreadUnits('')
      setCarbsGrams('')
      setDescription('')
      setNotes('')
      onClose?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save food entry')
    } finally {
      setSaving(false)
    }
  }

  const carbsPreview = breadUnits && !isNaN(Number(breadUnits))
    ? (Number(breadUnits) * 12).toFixed(0)
    : null

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">Add Food Entry</h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="food-description" className="block text-sm font-medium text-gray-700 mb-1">
          What did you eat?
        </label>
        <input
          id="food-description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Sandwich, Rice with chicken..."
          autoFocus
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="food-bu" className="block text-sm font-medium text-gray-700 mb-1">
            Bread Units (BU)
          </label>
          <input
            id="food-bu"
            type="number"
            value={breadUnits}
            onChange={(e) => setBreadUnits(e.target.value)}
            placeholder="e.g. 3"
            step="0.5"
            min="0"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label htmlFor="food-carbs" className="block text-sm font-medium text-gray-700 mb-1">
            Carbs (g) <span className="text-gray-400 font-normal">optional</span>
          </label>
          <input
            id="food-carbs"
            type="number"
            value={carbsGrams}
            onChange={(e) => setCarbsGrams(e.target.value)}
            placeholder={carbsPreview ? `~${carbsPreview}g` : 'e.g. 36'}
            step="1"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {carbsPreview && !carbsGrams && (
        <p className="text-xs text-gray-500">
          Estimated ~{carbsPreview}g carbs (1 BU = 12g carbs)
        </p>
      )}

      <div>
        <label htmlFor="food-time" className="block text-sm font-medium text-gray-700 mb-1">
          Date & Time
        </label>
        <input
          id="food-time"
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label htmlFor="food-notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <input
          id="food-notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Before workout, with medication..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Entry'}
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
