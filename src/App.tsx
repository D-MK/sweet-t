import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useGlucoseStore } from '@/stores/glucoseStore'
import { useFoodStore } from '@/stores/foodStore'
import { useInsulinStore } from '@/stores/insulinStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { testConnection } from '@/services/turso'
import { getGlucoseReadings } from '@/services/glucoseService'
import { getFoodEntries } from '@/services/foodService'
import { getInsulinDoses } from '@/services/insulinService'
import { getUserSettings, upsertUserSettings } from '@/services/settingsService'
import AuthProvider from '@/components/Auth/AuthProvider'
import Calculator from '@/components/Calculator/Calculator'
import TodaySummary from '@/components/Calculator/TodaySummary'
import GlucoseTimeline from '@/components/Glucose/GlucoseTimeline'
import FoodLog from '@/components/Food/FoodLog'
import DoseLog from '@/components/Insulin/DoseLog'
import ProfilePage from '@/components/Profile/ProfilePage'
import ToastContainer from '@/components/common/ToastContainer'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import Spinner from '@/components/common/Spinner'

type TabId = 'home' | 'glucose' | 'food' | 'insulin' | 'profile'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'glucose', label: 'Glucose', icon: '📊' },
  { id: 'food', label: 'Food', icon: '🍽️' },
  { id: 'insulin', label: 'Insulin', icon: '💉' },
  { id: 'profile', label: 'Profile', icon: '👤' },
]

function DashboardContent() {
  const { user } = useAuthStore()
  const { setReadings } = useGlucoseStore()
  const { setEntries } = useFoodStore()
  const { setDoses } = useInsulinStore()
  const { setSettings } = useSettingsStore()
  const [dbConnected, setDbConnected] = useState<boolean | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [currentTab, setCurrentTab] = useState<TabId>('home')

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
      setDataLoading(true)
      try {
        const [readings, entries, doses, settings] = await Promise.all([
          getGlucoseReadings(user.uid),
          getFoodEntries(user.uid),
          getInsulinDoses(user.uid),
          getUserSettings(user.uid),
        ])
        setReadings(readings)
        setEntries(entries)
        setDoses(doses)

        if (settings) {
          setSettings(settings)
        } else {
          // Create default settings for new user
          const defaultSettings = await upsertUserSettings(user.uid, {})
          setSettings(defaultSettings)
        }
      } catch (err) {
        console.error('Failed to load user data:', err)
      } finally {
        setDataLoading(false)
      }
    }
    loadData()
  }, [dbConnected, user?.uid, setReadings, setEntries, setDoses, setSettings])

  if (dbConnected === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-500">Connecting to database...</p>
        </div>
      </div>
    )
  }

  if (dbConnected === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center px-6">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Sweet-T</h1>
          <p className="text-red-500 mb-2">Database connection failed</p>
          <p className="text-gray-500 text-sm">Please check your Turso credentials in .env</p>
        </div>
      </div>
    )
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-500">Loading your data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-0">
      {/* Desktop header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Sweet-T</h1>
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-sm text-gray-600">{user?.email}</div>
          </div>
        </div>
      </header>

      {/* Desktop tab bar */}
      <div className="hidden sm:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
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

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ErrorBoundary>
          {currentTab === 'home' && (
            <div className="space-y-6">
              <Calculator />
              <TodaySummary />
            </div>
          )}
          {currentTab === 'glucose' && <GlucoseTimeline />}
          {currentTab === 'food' && <FoodLog />}
          {currentTab === 'insulin' && <DoseLog />}
          {currentTab === 'profile' && <ProfilePage />}
        </ErrorBoundary>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
        <div className="flex justify-around">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 pt-3 min-h-[56px] transition-colors ${
                currentTab === tab.id
                  ? 'text-indigo-600'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className="text-[10px] font-medium mt-1">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <ToastContainer />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DashboardContent />
      </AuthProvider>
    </ErrorBoundary>
  )
}
