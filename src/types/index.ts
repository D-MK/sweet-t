export * from './database'

export interface AuthState {
  user: any | null
  isLoading: boolean
  error: string | null
}

export interface AppState {
  glucoseUnit: 'mg/dL' | 'mmol/L'
  theme: 'light' | 'dark' | 'system'
}
