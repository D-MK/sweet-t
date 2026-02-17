import { db } from '@/services/turso'
import type { UserSettings } from '@/types'

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM user_settings WHERE user_id = ?',
      args: [userId],
    })
    if (result.rows.length === 0) return null

    const row = result.rows[0]
    return {
      user_id: row.user_id as string,
      glucose_unit: row.glucose_unit as 'mg/dL' | 'mmol/L',
      target_glucose_min: row.target_glucose_min as number,
      target_glucose_max: row.target_glucose_max as number,
      theme: row.theme as 'light' | 'dark' | 'system',
      updated_at: row.updated_at as number,
    }
  } catch (error) {
    console.error('Failed to fetch user settings:', error)
    throw error
  }
}

export async function upsertUserSettings(
  userId: string,
  settings: Partial<Omit<UserSettings, 'user_id' | 'updated_at'>>
): Promise<UserSettings> {
  try {
    const now = Date.now()
    const existing = await getUserSettings(userId)

    if (existing) {
      const fields: string[] = []
      const args: (string | number)[] = []

      if (settings.glucose_unit !== undefined) { fields.push('glucose_unit = ?'); args.push(settings.glucose_unit) }
      if (settings.target_glucose_min !== undefined) { fields.push('target_glucose_min = ?'); args.push(settings.target_glucose_min) }
      if (settings.target_glucose_max !== undefined) { fields.push('target_glucose_max = ?'); args.push(settings.target_glucose_max) }
      if (settings.theme !== undefined) { fields.push('theme = ?'); args.push(settings.theme) }
      fields.push('updated_at = ?')
      args.push(now)
      args.push(userId)

      await db.execute({
        sql: `UPDATE user_settings SET ${fields.join(', ')} WHERE user_id = ?`,
        args,
      })

      return {
        ...existing,
        ...settings,
        updated_at: now,
      }
    } else {
      const newSettings: UserSettings = {
        user_id: userId,
        glucose_unit: settings.glucose_unit ?? 'mg/dL',
        target_glucose_min: settings.target_glucose_min ?? 80,
        target_glucose_max: settings.target_glucose_max ?? 120,
        theme: settings.theme ?? 'light',
        updated_at: now,
      }

      await db.execute({
        sql: `INSERT INTO user_settings (user_id, glucose_unit, target_glucose_min, target_glucose_max, theme, updated_at)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [newSettings.user_id, newSettings.glucose_unit, newSettings.target_glucose_min, newSettings.target_glucose_max, newSettings.theme, newSettings.updated_at],
      })

      return newSettings
    }
  } catch (error) {
    console.error('Failed to upsert user settings:', error)
    throw error
  }
}
