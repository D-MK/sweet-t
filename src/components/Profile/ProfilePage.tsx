import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useGlucoseStore } from '@/stores/glucoseStore'
import { useFoodStore } from '@/stores/foodStore'
import { useInsulinStore } from '@/stores/insulinStore'
import { upsertUserSettings } from '@/services/settingsService'
import { logout } from '@/services/auth'
import { useToastStore } from '@/stores/toastStore'
import { formatDate } from '@/lib/utils'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const { settings, setSettings } = useSettingsStore()
  const { readings } = useGlucoseStore()
  const { entries } = useFoodStore()
  const { doses } = useInsulinStore()
  const { addToast } = useToastStore()
  const [saving, setSaving] = useState(false)

  const handleUnitChange = async (unit: 'mg/dL' | 'mmol/L') => {
    if (!user?.uid || saving) return
    setSaving(true)
    try {
      const updated = await upsertUserSettings(user.uid, { glucose_unit: unit })
      setSettings(updated)
      addToast(`Unit changed to ${unit}`)
    } catch {
      addToast('Failed to update unit', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    if (!user?.uid || saving) return
    setSaving(true)
    try {
      const updated = await upsertUserSettings(user.uid, { theme })
      setSettings(updated)
      applyTheme(theme)
      addToast(`Theme set to ${theme}`)
    } catch {
      addToast('Failed to update theme', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleTargetChange = async (min: number, max: number) => {
    if (!user?.uid || saving) return
    setSaving(true)
    try {
      const updated = await upsertUserSettings(user.uid, {
        target_glucose_min: min,
        target_glucose_max: max,
      })
      setSettings(updated)
      addToast('Target range updated')
    } catch {
      addToast('Failed to update target range', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleExportCSV = () => {
    const lines: string[] = []

    // Glucose readings
    lines.push('--- Glucose Readings ---')
    lines.push('Date,Value,Unit,Calculated Insulin,Notes')
    for (const r of readings) {
      lines.push(
        `${formatDate(r.timestamp)},${r.value},${r.unit},${r.calculated_insulin ?? ''},${(r.notes ?? '').replace(/,/g, ';')}`
      )
    }

    lines.push('')
    lines.push('--- Food Entries ---')
    lines.push('Date,Bread Units,Carbs (g),Description,Notes')
    for (const e of entries) {
      lines.push(
        `${formatDate(e.timestamp)},${e.bread_units},${e.carbs_grams ?? ''},${(e.description ?? '').replace(/,/g, ';')},${(e.notes ?? '').replace(/,/g, ';')}`
      )
    }

    lines.push('')
    lines.push('--- Insulin Doses ---')
    lines.push('Date,Units,Type,Notes')
    for (const d of doses) {
      lines.push(
        `${formatDate(d.timestamp)},${d.units},${d.insulin_type},${(d.notes ?? '').replace(/,/g, ';')}`
      )
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sweet-t-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    addToast('Data exported to CSV')
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      addToast('Logout failed', 'error')
    }
  }

  const currentUnit = settings?.glucose_unit ?? 'mg/dL'
  const currentTheme = settings?.theme ?? 'light'
  const targetMin = settings?.target_glucose_min ?? 80
  const targetMax = settings?.target_glucose_max ?? 120

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Profile & Settings</h2>

      {/* User Profile Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-16 h-16 rounded-full border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
              {(user?.displayName || user?.email || '?')[0].toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {user?.displayName || 'Sweet-T User'}
            </h3>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              Signed in via {user?.provider === 'google.com' ? 'Google' : user?.provider === 'github.com' ? 'GitHub' : 'Email'}
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 text-center">
          <div>
            <p className="text-2xl font-bold text-indigo-600">{readings.length}</p>
            <p className="text-xs text-gray-500">Readings</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">{entries.length}</p>
            <p className="text-xs text-gray-500">Meals</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600">{doses.length}</p>
            <p className="text-xs text-gray-500">Doses</p>
          </div>
        </div>
      </div>

      {/* Glucose Unit Preference */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Glucose Unit</h3>
        <div className="grid grid-cols-2 gap-3">
          {(['mg/dL', 'mmol/L'] as const).map((unit) => (
            <button
              key={unit}
              onClick={() => handleUnitChange(unit)}
              disabled={saving}
              className={`p-3 rounded-lg border-2 text-center transition-all font-medium ${
                currentUnit === unit
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>

      {/* Target Glucose Range */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Target Glucose Range ({currentUnit})</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Low target</span>
              <span className="font-medium text-gray-900">{targetMin} {currentUnit}</span>
            </div>
            <input
              type="range"
              min={currentUnit === 'mg/dL' ? 50 : 3}
              max={currentUnit === 'mg/dL' ? 120 : 7}
              step={currentUnit === 'mg/dL' ? 5 : 0.5}
              value={targetMin}
              onChange={(e) => handleTargetChange(Number(e.target.value), targetMax)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">High target</span>
              <span className="font-medium text-gray-900">{targetMax} {currentUnit}</span>
            </div>
            <input
              type="range"
              min={currentUnit === 'mg/dL' ? 100 : 5}
              max={currentUnit === 'mg/dL' ? 250 : 14}
              step={currentUnit === 'mg/dL' ? 5 : 0.5}
              value={targetMax}
              onChange={(e) => handleTargetChange(targetMin, Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-sm text-green-800">
              Target range: <span className="font-semibold">{targetMin}</span> – <span className="font-semibold">{targetMax}</span> {currentUnit}
            </span>
          </div>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          {([
            { value: 'light' as const, label: 'Light', icon: '☀️' },
            { value: 'dark' as const, label: 'Dark', icon: '🌙' },
            { value: 'system' as const, label: 'System', icon: '💻' },
          ]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleThemeChange(opt.value)}
              disabled={saving}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                currentTheme === opt.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-xl mb-1">{opt.icon}</div>
              <p className="text-sm font-medium">{opt.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Export Data */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Data Management</h3>
        <button
          onClick={handleExportCSV}
          className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm flex items-center justify-center gap-2"
        >
          <span>📥</span>
          Export All Data to CSV
        </button>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Downloads glucose readings, food entries, and insulin doses
        </p>
      </div>

      {/* Logout */}
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm border border-red-200"
        >
          Sign Out
        </button>
      </div>

      {/* App info */}
      <div className="text-center pb-8">
        <p className="text-xs text-gray-400">Sweet-T v0.1.0</p>
        <p className="text-xs text-gray-400">Glucose Tracking for Diabetes Management</p>
      </div>
    </div>
  )
}

function applyTheme(theme: 'light' | 'dark' | 'system') {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  } else {
    root.classList.remove('dark')
  }
}
