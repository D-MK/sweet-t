import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useGlucoseStore } from '@/stores/glucoseStore'
import { useFoodStore } from '@/stores/foodStore'
import { useInsulinStore } from '@/stores/insulinStore'
import { testConnection } from '@/services/turso'
import { getGlucoseReadings } from '@/services/glucoseService'
import { getFoodEntries } from '@/services/foodService'
import { getInsulinDoses } from '@/services/insulinService'
import AuthProvider from '@/components/Auth/AuthProvider'
import Calculator from '@/components/Calculator/Calculator'
import TodaySummary from '@/components/Calculator/TodaySummary'
import LogoutButton from '@/components/common/LogoutButton'
import GlucoseTimeline from '@/components/Glucose/GlucoseTimeline'
import FoodLog from '@/components/Food/FoodLog'
import DoseLog from '@/components/Insulin/DoseLog'

function DashboardContent() {
  const { user } = useAuthStore()
  const { setReadings } = useGlucoseStore()
  const { setEntries } = useFoodStore()
  const { setDoses } = useInsulinStore()
  const [dbConnected, setDbConnected] = useState<boolean | null>(null)
  const [currentTab, setCurrentTab] = useState<'home' | 'glucose' | 'food' | 'insulin' | 'profile'>('home')

  useEffect(() => {
    const checkDb = async () => {
      const connected = await testConnection()
      setDbConnected(connected)
    }
    checkDb()
  }, [])

  // Load all user data once DB is connected and user is authenticated
  useEffect(() => {
    if (!dbConnected || !user?.uid) return

    const loadData = async () => {
      try {
        const [readings, entries, doses] = await Promise.all([
          getGlucoseReadings(user.uid),
          getFoodEntries(user.uid),
          getInsulinDoses(user.uid),
        ])
        setReadings(readings)
        setEntries(entries)
        setDoses(doses)
      } catch (err) {
        console.error('Failed to load user data:', err)
      }
    }
    loadData()
  }, [dbConnected, user?.uid, setReadings, setEntries, setDoses])

  if (dbConnected === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">Initializing database...</p>
        </div>
      </div>
    )
  }

  if (dbConnected === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sweet-T</h1>
          <p className="text-red-500 mb-2">Database connection failed</p>
          <p className="text-gray-500 text-sm">Please check your Turso credentials in .env</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'home' as const, label: 'Home', icon: '🏠' },
    { id: 'glucose' as const, label: 'Glucose', icon: '📊' },
    { id: 'food' as const, label: 'Food', icon: '🍽️' },
    { id: 'insulin' as const, label: 'Insulin', icon: '💉' },
    { id: 'profile' as const, label: 'Profile', icon: '👤' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Sweet-T</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">{user?.email}</div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  currentTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'home' && (
          <div className="space-y-6">
            <Calculator />
            <TodaySummary />
          </div>
        )}

        {currentTab === 'glucose' && <GlucoseTimeline />}

        {currentTab === 'food' && <FoodLog />}

        {currentTab === 'insulin' && <DoseLog />}

        {currentTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p className="text-gray-500">Coming soon...</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  )
}
