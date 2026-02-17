import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read .env manually
const envPath = resolve(__dirname, '..', '.env')
const envContent = readFileSync(envPath, 'utf-8')
const env = {}
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const [key, ...valueParts] = trimmed.split('=')
  env[key.trim()] = valueParts.join('=').trim()
}

const url = env.VITE_TURSO_URL
const authToken = env.VITE_TURSO_AUTH_TOKEN

if (!url || !authToken) {
  console.error('Missing VITE_TURSO_URL or VITE_TURSO_AUTH_TOKEN in .env')
  process.exit(1)
}

console.log(`Connecting to Turso: ${url}`)

const db = createClient({ url, authToken })

// Read migration SQL
const sqlPath = resolve(__dirname, '..', 'migrations', '001_initial_schema.sql')
const sql = readFileSync(sqlPath, 'utf-8')

// Remove SQL comments, then split by semicolons
const cleanSql = sql.replace(/--.*$/gm, '')
const statements = cleanSql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0)

console.log(`Running ${statements.length} SQL statements...`)

for (const stmt of statements) {
  try {
    await db.execute(stmt)
    const preview = stmt.substring(0, 70).replace(/\n/g, ' ')
    console.log(`  OK: ${preview}...`)
  } catch (error) {
    console.error(`  FAIL: ${stmt.substring(0, 70).replace(/\n/g, ' ')}...`)
    console.error(`    Error: ${error.message}`)
  }
}

console.log('\nMigration complete!')
process.exit(0)
