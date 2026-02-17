import type { InsulinDose } from '@/types'
import { formatDateTime } from '@/lib/utils'
import { useInsulinStore } from '@/stores/insulinStore'
import { useGlucoseStore } from '@/stores/glucoseStore'
import { deleteInsulinDose } from '@/services/insulinService'
import { useState } from 'react'

interface DoseCardProps {
  dose: InsulinDose
}

const TYPE_STYLES: Record<string, { bg: string; label: string }> = {
  rapid: { bg: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Rapid' },
  long: { bg: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Long' },
  mixed: { bg: 'bg-teal-100 text-teal-800 border-teal-200', label: 'Mixed' },
}

export default function DoseCard({ dose }: DoseCardProps) {
  const { deleteDose } = useInsulinStore()
  const { readings } = useGlucoseStore()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const typeStyle = TYPE_STYLES[dose.insulin_type] ?? TYPE_STYLES.rapid

  const linkedReading = dose.linked_reading_id
    ? readings.find((r) => r.id === dose.linked_reading_id)
    : null

  const handleDelete = async () => {
    if (confirmDelete) {
      try {
        await deleteInsulinDose(dose.id)
        deleteDose(dose.id)
      } catch (err) {
        console.error('Failed to delete insulin dose:', err)
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
          <p className="text-2xl font-bold text-gray-900">{dose.units}</p>
          <p className="text-xs text-gray-500">units</p>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${typeStyle.bg}`}>
              {typeStyle.label}
            </span>
            {linkedReading && (
              <span className="text-xs text-gray-500">
                @ {linkedReading.value} {linkedReading.unit}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{formatDateTime(dose.timestamp)}</p>
          {dose.notes && (
            <p className="text-sm text-gray-600 truncate">{dose.notes}</p>
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
