import { logout } from '@/services/auth'
import { useAuthStore } from '@/stores/authStore'
import { useState } from 'react'

export default function LogoutButton() {
  const { setLoading } = useAuthStore()
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    setLoading(true)
    setError(null)
    try {
      await logout()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleLogout}
        className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium text-sm"
      >
        Logout
      </button>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </>
  )
}
