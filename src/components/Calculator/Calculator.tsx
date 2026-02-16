import { useState } from 'react'
import { calculateInsulin } from '@/lib/utils'
import { useGlucoseStore } from '@/stores/glucoseStore'
import { addGlucoseReading } from '@/services/glucoseService'

export default function Calculator() {
  const [glucoseValue, setGlucoseValue] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const [unit, setUnit] = useState<'mg/dL' | 'mmol/L'>('mg/dL')
  const [saved, setSaved] = useState(false)
  const { addReading } = useGlucoseStore()

  const handleCalculate = async () => {
    if (!glucoseValue || isNaN(Number(glucoseValue))) {
      return
    }

    const glucose = Number(glucoseValue)

    // If mmol/L, convert to mg/dL for calculation
    const glucoseInMgDl = unit === 'mmol/L' ? glucose * 18 : glucose

    const insulin = calculateInsulin(glucoseInMgDl)
    setResult(insulin)
    setSaved(false)

    // Auto-save to glucose readings
    try {
      const reading = await addGlucoseReading({
        user_id: '',
        value: glucose,
        unit,
        calculated_insulin: insulin,
        timestamp: Date.now(),
      })
      addReading(reading)
      setSaved(true)
    } catch {
      // Silently fail auto-save — user can still see the result
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6">Insulin Calculator</h2>

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="glucose" className="block text-sm font-medium text-gray-700 mb-2">
              Glucose Reading ({unit})
            </label>
            <input
              id="glucose"
              type="number"
              value={glucoseValue}
              onChange={(e) => setGlucoseValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter glucose value"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              step="0.1"
            />
          </div>

          <div className="flex-1">
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
              Unit
            </label>
            <select
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'mg/dL' | 'mmol/L')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="mg/dL">mg/dL</option>
              <option value="mmol/L">mmol/L</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Calculate
        </button>
      </div>

      {result !== null && (
        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Recommended Insulin Dose:</p>
          <p className="text-4xl font-bold text-indigo-600">{result.toFixed(1)}</p>
          <p className="text-sm text-gray-600 mt-2">units</p>
          <p className="text-xs text-gray-500 mt-4">
            Formula: ((glucose × 18) - 80) ÷ 40
          </p>
          {saved && (
            <p className="text-xs text-green-600 mt-2">Saved to glucose readings</p>
          )}
        </div>
      )}
    </div>
  )
}
