export interface User {
  id: string
  email: string
  provider: 'google' | 'github'
  provider_id: string
  created_at: number
  updated_at: number
}

export interface GlucoseReading {
  id: string
  user_id: string
  value: number
  unit: 'mg/dL' | 'mmol/L'
  calculated_insulin?: number
  timestamp: number
  notes?: string
  created_at: number
}

export interface FoodEntry {
  id: string
  user_id: string
  bread_units: number
  carbs_grams?: number
  description?: string
  timestamp: number
  notes?: string
  created_at: number
}

export interface InsulinDose {
  id: string
  user_id: string
  units: number
  insulin_type: 'rapid' | 'long' | 'mixed'
  timestamp: number
  linked_reading_id?: string
  notes?: string
  created_at: number
}

export interface UserSettings {
  user_id: string
  glucose_unit: 'mg/dL' | 'mmol/L'
  target_glucose_min: number
  target_glucose_max: number
  theme: 'light' | 'dark' | 'system'
  updated_at: number
}
