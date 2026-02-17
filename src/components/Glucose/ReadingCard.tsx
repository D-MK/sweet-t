import type { GlucoseReading } from '@/types'
import { formatDateTime } from '@/lib/utils'
import { useGlucoseStore } from '@/stores/glucoseStore'
import { deleteGlucoseReading } from '@/services/glucoseService'
import { useState } from 'react'

interface ReadingCardProps {
  reading: GlucoseReading
}

export default function ReadingCard({ reading }: ReadingCardProps) {
  const { deleteReading } = useGlucoseStore()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = async () => {
    if (confirmDelete) {
      try {
        await deleteGlucoseReading(reading.id)
        deleteReading(reading.id)
      } catch (err) {
        console.error('Failed to delete reading:', err)
      }
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  // Color coding based on glucose ranges (mg/dL ranges, convert if mmol/L)
  const mgDlValue = reading.unit === 'mmol/L' ? reading.value * 18 : reading.value
  let statusColor = 'bg-green-100 text-green-800 border-green-200'
  let statusLabel = 'Normal'
  if (mgDlValue < 70) {
    statusColor = 'bg-red-100 text-red-800 border-red-200'
    statusLabel = 'Low'
  } else if (mgDlValue > 180) {
    statusColor = 'bg-red-100 text-red-800 border-red-200'
    statusLabel = 'High'
  } else if (mgDlValue > 140) {
    statusColor = 'bg-yellow-100 text-yellow-800 border-yellow-200'
    statusLabel = 'Elevated'
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="text-center flex-shrink-0">
          <p className="text-2xl font-bold text-gray-900">{reading.value}</p>
          <p className="text-xs text-gray-500">{reading.unit}</p>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor}`}>
              {statusLabel}
            </span>
            {reading.calculated_insulin != null && (
              <span className="text-xs text-gray-500">
                {reading.calculated_insulin.toFixed(1)}u insulin
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{formatDateTime(reading.timestamp)}</p>
          {reading.notes && (
            <p className="text-sm text-gray-600 truncate">{reading.notes}</p>
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
