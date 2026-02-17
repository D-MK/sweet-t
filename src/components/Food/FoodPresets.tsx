import { useState } from 'react'
import { useFoodStore } from '@/stores/foodStore'
import { addFoodEntry } from '@/services/foodService'
import { useToastStore } from '@/stores/toastStore'

interface FoodPreset {
  name: string
  bread_units: number
  carbs_grams: number
  emoji: string
}

const PRESETS: FoodPreset[] = [
  { name: 'Slice of bread', bread_units: 1, carbs_grams: 12, emoji: '🍞' },
  { name: 'Apple', bread_units: 1.5, carbs_grams: 18, emoji: '🍎' },
  { name: 'Banana', bread_units: 2, carbs_grams: 24, emoji: '🍌' },
  { name: 'Bowl of rice', bread_units: 4, carbs_grams: 48, emoji: '🍚' },
  { name: 'Pasta serving', bread_units: 5, carbs_grams: 60, emoji: '🍝' },
  { name: 'Glass of milk', bread_units: 1, carbs_grams: 12, emoji: '🥛' },
  { name: 'Glass of juice', bread_units: 2, carbs_grams: 24, emoji: '🧃' },
  { name: 'Potato (medium)', bread_units: 2.5, carbs_grams: 30, emoji: '🥔' },
  { name: 'Yogurt', bread_units: 1.5, carbs_grams: 18, emoji: '🫙' },
  { name: 'Chocolate bar', bread_units: 3, carbs_grams: 36, emoji: '🍫' },
  { name: 'Cookie', bread_units: 1.5, carbs_grams: 18, emoji: '🍪' },
  { name: 'Cereal bowl', bread_units: 3, carbs_grams: 36, emoji: '🥣' },
]

export default function FoodPresets() {
  const { addEntry } = useFoodStore()
  const { addToast } = useToastStore()
  const [savingPreset, setSavingPreset] = useState<string | null>(null)

  const handleQuickAdd = async (preset: FoodPreset) => {
    setSavingPreset(preset.name)
    try {
      const entry = await addFoodEntry({
        user_id: '',
        bread_units: preset.bread_units,
        carbs_grams: preset.carbs_grams,
        description: preset.name,
        timestamp: Date.now(),
      })
      addEntry(entry)
      addToast(`Added ${preset.name}`)
    } catch (err) {
      console.error('Failed to quick-add food:', err)
      addToast('Failed to add food', 'error')
    } finally {
      setSavingPreset(null)
    }
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Add</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => handleQuickAdd(preset)}
            disabled={savingPreset === preset.name}
            className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-left disabled:opacity-50"
          >
            <span className="text-xl flex-shrink-0">{preset.emoji}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{preset.name}</p>
              <p className="text-xs text-gray-500">{preset.bread_units} BU / {preset.carbs_grams}g</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
