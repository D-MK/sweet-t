import type { FoodEntry } from '@/types'
import { formatDateTime } from '@/lib/utils'
import { useFoodStore } from '@/stores/foodStore'
import { deleteFoodEntry } from '@/services/foodService'
import { useState } from 'react'

interface FoodCardProps {
  entry: FoodEntry
}

export default function FoodCard({ entry }: FoodCardProps) {
  const { deleteEntry } = useFoodStore()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = async () => {
    if (confirmDelete) {
      try {
        await deleteFoodEntry(entry.id)
        deleteEntry(entry.id)
      } catch (err) {
        console.error('Failed to delete food entry:', err)
      }
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="text-center flex-shrink-0">
          <p className="text-2xl font-bold text-gray-900">{entry.bread_units}</p>
          <p className="text-xs text-gray-500">BU</p>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {entry.description && (
              <span className="text-sm font-medium text-gray-900 truncate">
                {entry.description}
              </span>
            )}
            {entry.carbs_grams != null && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                {entry.carbs_grams}g carbs
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{formatDateTime(entry.timestamp)}</p>
          {entry.notes && (
            <p className="text-sm text-gray-600 truncate">{entry.notes}</p>
          )}
        </div>
      </div>

      <button
        onClick={handleDelete}
        className={`flex-shrink-0 text-sm px-3 py-1 rounded-lg transition-colors ${
          confirmDelete
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
        }`}
      >
        {confirmDelete ? 'Confirm' : 'Delete'}
      </button>
    </div>
  )
}
