import { db } from '@/services/turso'
import { auth } from '@/lib/firebase'
import type { FoodEntry } from '@/types'

export async function getFoodEntries(userId: string): Promise<FoodEntry[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM food_entries WHERE user_id = ? ORDER BY timestamp DESC',
      args: [userId],
    })
    return result.rows.map((row) => ({
      id: row.id as string,
      user_id: row.user_id as string,
      bread_units: row.bread_units as number,
      carbs_grams: row.carbs_grams as number | undefined,
      description: row.description as string | undefined,
      timestamp: row.timestamp as number,
      notes: row.notes as string | undefined,
      created_at: row.created_at as number,
    }))
  } catch (error) {
    console.error('Failed to fetch food entries:', error)
    throw error
  }
}

export async function addFoodEntry(entry: Omit<FoodEntry, 'id' | 'created_at'>): Promise<FoodEntry> {
  try {
    const userId = auth.currentUser?.uid
    if (!userId) throw new Error('User not authenticated')

    const id = `food_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const createdAt = Date.now()

    await db.execute({
      sql: `INSERT INTO food_entries (id, user_id, bread_units, carbs_grams, description, timestamp, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, userId, entry.bread_units, entry.carbs_grams ?? null, entry.description ?? null, entry.timestamp, entry.notes ?? null, createdAt],
    })

    return {
      ...entry,
      id,
      user_id: userId,
      created_at: createdAt,
    }
  } catch (error) {
    console.error('Failed to add food entry:', error)
    throw error
  }
}

export async function updateFoodEntry(id: string, updates: Partial<FoodEntry>): Promise<FoodEntry | null> {
  try {
    const userId = auth.currentUser?.uid
    if (!userId) throw new Error('User not authenticated')

    const fields: string[] = []
    const args: (string | number | null)[] = []

    if (updates.bread_units !== undefined) { fields.push('bread_units = ?'); args.push(updates.bread_units) }
    if (updates.carbs_grams !== undefined) { fields.push('carbs_grams = ?'); args.push(updates.carbs_grams ?? null) }
    if (updates.description !== undefined) { fields.push('description = ?'); args.push(updates.description ?? null) }
    if (updates.timestamp !== undefined) { fields.push('timestamp = ?'); args.push(updates.timestamp) }
    if (updates.notes !== undefined) { fields.push('notes = ?'); args.push(updates.notes ?? null) }

    if (fields.length === 0) return null

    args.push(id, userId)
    await db.execute({
      sql: `UPDATE food_entries SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      args,
    })

    const result = await db.execute({
      sql: 'SELECT * FROM food_entries WHERE id = ? AND user_id = ?',
      args: [id, userId],
    })

    if (result.rows.length === 0) return null

    const row = result.rows[0]
    return {
      id: row.id as string,
      user_id: row.user_id as string,
      bread_units: row.bread_units as number,
      carbs_grams: row.carbs_grams as number | undefined,
      description: row.description as string | undefined,
      timestamp: row.timestamp as number,
      notes: row.notes as string | undefined,
      created_at: row.created_at as number,
    }
  } catch (error) {
    console.error('Failed to update food entry:', error)
    throw error
  }
}

export async function deleteFoodEntry(id: string): Promise<boolean> {
  try {
    const userId = auth.currentUser?.uid
    if (!userId) throw new Error('User not authenticated')

    const result = await db.execute({
      sql: 'DELETE FROM food_entries WHERE id = ? AND user_id = ?',
      args: [id, userId],
    })
    return result.rowsAffected > 0
  } catch (error) {
    console.error('Failed to delete food entry:', error)
    throw error
  }
}
