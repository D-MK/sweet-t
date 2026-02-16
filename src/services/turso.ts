import { createClient } from '@libsql/client'

const tursoUrl = import.meta.env.VITE_TURSO_URL
const tursoToken = import.meta.env.VITE_TURSO_AUTH_TOKEN

if (!tursoUrl || !tursoToken) {
  throw new Error('Turso credentials not configured. Please set VITE_TURSO_URL and VITE_TURSO_AUTH_TOKEN in .env')
}

export const db = createClient({
  url: tursoUrl,
  authToken: tursoToken,
})

// Health check
export async function testConnection(): Promise<boolean> {
  try {
    const result = await db.execute('SELECT 1')
    return !!result
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}
