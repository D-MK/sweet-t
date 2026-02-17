import { db } from '@/services/turso'
import { auth } from '@/lib/firebase'
import type { GlucoseReading } from '@/types'

export async function getGlucoseReadings(userId: string): Promise<GlucoseReading[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM glucose_readings WHERE user_id = ? ORDER BY timestamp DESC',
      args: [userId],
    })
    return result.rows.map((row) => ({
      id: row.id as string,
      user_id: row.user_id as string,
      value: row.value as number,
      unit: row.unit as 'mg/dL' | 'mmol/L',
      calculated_insulin: row.calculated_insulin as number | undefined,
      timestamp: row.timestamp as number,
      notes: row.notes as string | undefined,
      created_at: row.created_at as number,
    }))
  } catch (error) {
    console.error('Failed to fetch glucose readings:', error)
    throw error
  }
}

export async function addGlucoseReading(reading: Omit<GlucoseReading, 'id' | 'created_at'>): Promise<GlucoseReading> {
  try {
    const userId = auth.currentUser?.uid
    if (!userId) throw new Error('User not authenticated')

    const id = `glucose_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const createdAt = Date.now()

    await db.execute({
      sql: `INSERT INTO glucose_readings (id, user_id, value, unit, calculated_insulin, timestamp, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, userId, reading.value, reading.unit, reading.calculated_insulin ?? null, reading.timestamp, reading.notes ?? null, createdAt],
    })

    return {
      ...reading,
      id,
      user_id: userId,
      created_at: createdAt,
    }
  } catch (error) {
    console.error('Failed to add glucose reading:', error)
    throw error
  }
}

export async function updateGlucoseReading(id: string, updates: Partial<GlucoseReading>): Promise<GlucoseReading | null> {
  try {
    const userId = auth.currentUser?.uid
    if (!userId) throw new Error('User not authenticated')

    const fields: string[] = []
    const args: (string | number | null)[] = []

    if (updates.value !== undefined) { fields.push('value = ?'); args.push(updates.value) }
    if (updates.unit !== undefined) { fields.push('unit = ?'); args.push(updates.unit) }
    if (updates.calculated_insulin !== undefined) { fields.push('calculated_insulin = ?'); args.push(updates.calculated_insulin) }
    if (updates.timestamp !== undefined) { fields.push('timestamp = ?'); args.push(updates.timestamp) }
    if (updates.notes !== undefined) { fields.push('notes = ?'); args.push(updates.notes ?? null) }

    if (fields.length === 0) return null

    args.push(id, userId)
    await db.execute({
      sql: `UPDATE glucose_readings SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      args,
    })

    const result = await db.execute({
      sql: 'SELECT * FROM glucose_readings WHERE id = ? AND user_id = ?',
      args: [id, userId],
    })

    if (result.rows.length === 0) return null

    const row = result.rows[0]
    return {
      id: row.id as string,
      user_id: row.user_id as string,
      value: row.value as number,
      unit: row.unit as 'mg/dL' | 'mmol/L',
      calculated_insulin: row.calculated_insulin as number | undefined,
      timestamp: row.timestamp as number,
      notes: row.notes as string | undefined,
      created_at: row.created_at as number,
    }
  } catch (error) {
    console.error('Failed to update glucose reading:', error)
    throw error
  }
}

export async function deleteGlucoseReading(id: string): Promise<boolean> {
  try {
    const userId = auth.currentUser?.uid
    if (!userId) throw new Error('User not authenticated')

    const result = await db.execute({
      sql: 'DELETE FROM glucose_readings WHERE id = ? AND user_id = ?',
      args: [id, userId],
    })
    return result.rowsAffected > 0
  } catch (error) {
    console.error('Failed to delete glucose reading:', error)
    throw error
  }
}
