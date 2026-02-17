import { db } from '@/services/turso'
import { auth } from '@/lib/firebase'
import type { InsulinDose } from '@/types'

export async function getInsulinDoses(userId: string): Promise<InsulinDose[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM insulin_doses WHERE user_id = ? ORDER BY timestamp DESC',
      args: [userId],
    })
    return result.rows.map((row) => ({
      id: row.id as string,
      user_id: row.user_id as string,
      units: row.units as number,
      insulin_type: row.insulin_type as 'rapid' | 'long' | 'mixed',
      timestamp: row.timestamp as number,
      linked_reading_id: row.linked_reading_id as string | undefined,
      notes: row.notes as string | undefined,
      created_at: row.created_at as number,
    }))
  } catch (error) {
    console.error('Failed to fetch insulin doses:', error)
    throw error
  }
}

export async function addInsulinDose(dose: Omit<InsulinDose, 'id' | 'created_at'>): Promise<InsulinDose> {
  try {
    const userId = auth.currentUser?.uid
    if (!userId) throw new Error('User not authenticated')

    const id = `insulin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const createdAt = Date.now()

    await db.execute({
      sql: `INSERT INTO insulin_doses (id, user_id, units, insulin_type, timestamp, linked_reading_id, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, userId, dose.units, dose.insulin_type, dose.timestamp, dose.linked_reading_id ?? null, dose.notes ?? null, createdAt],
    })

    return {
      ...dose,
      id,
      user_id: userId,
      created_at: createdAt,
    }
  } catch (error) {
    console.error('Failed to add insulin dose:', error)
    throw error
  }
}

export async function updateInsulinDose(id: string, updates: Partial<InsulinDose>): Promise<InsulinDose | null> {
  try {
    const userId = auth.currentUser?.uid
    if (!userId) throw new Error('User not authenticated')

    const fields: string[] = []
    const args: (string | number | null)[] = []

    if (updates.units !== undefined) { fields.push('units = ?'); args.push(updates.units) }
    if (updates.insulin_type !== undefined) { fields.push('insulin_type = ?'); args.push(updates.insulin_type) }
    if (updates.timestamp !== undefined) { fields.push('timestamp = ?'); args.push(updates.timestamp) }
    if (updates.linked_reading_id !== undefined) { fields.push('linked_reading_id = ?'); args.push(updates.linked_reading_id ?? null) }
    if (updates.notes !== undefined) { fields.push('notes = ?'); args.push(updates.notes ?? null) }

    if (fields.length === 0) return null

    args.push(id, userId)
    await db.execute({
      sql: `UPDATE insulin_doses SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      args,
    })

    const result = await db.execute({
      sql: 'SELECT * FROM insulin_doses WHERE id = ? AND user_id = ?',
      args: [id, userId],
    })

    if (result.rows.length === 0) return null

    const row = result.rows[0]
    return {
      id: row.id as string,
      user_id: row.user_id as string,
      units: row.units as number,
      insulin_type: row.insulin_type as 'rapid' | 'long' | 'mixed',
      timestamp: row.timestamp as number,
      linked_reading_id: row.linked_reading_id as string | undefined,
      notes: row.notes as string | undefined,
      created_at: row.created_at as number,
    }
  } catch (error) {
    console.error('Failed to update insulin dose:', error)
    throw error
  }
}

export async function deleteInsulinDose(id: string): Promise<boolean> {
  try {
    const userId = auth.currentUser?.uid
    if (!userId) throw new Error('User not authenticated')

    const result = await db.execute({
      sql: 'DELETE FROM insulin_doses WHERE id = ? AND user_id = ?',
      args: [id, userId],
    })
    return result.rowsAffected > 0
  } catch (error) {
    console.error('Failed to delete insulin dose:', error)
    throw error
  }
}
