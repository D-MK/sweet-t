import { createClient } from '@libsql/client/web'

const rawUrl = import.meta.env.VITE_TURSO_URL?.trim()
const tursoToken = import.meta.env.VITE_TURSO_AUTH_TOKEN?.trim()

if (!rawUrl || !tursoToken) {
  throw new Error('Turso credentials not configured. Please set VITE_TURSO_URL and VITE_TURSO_AUTH_TOKEN in .env')
}

const tursoUrl = /^[a-z]+:\/\//i.test(rawUrl) ? rawUrl : `libsql://${rawUrl}`

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
