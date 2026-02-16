-- Users table (Firebase handles user creation, this is for additional metadata)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL, -- 'google' | 'github' | 'email'
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Glucose readings table
CREATE TABLE IF NOT EXISTS glucose_readings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT NOT NULL, -- 'mg/dL' | 'mmol/L'
  calculated_insulin REAL,
  timestamp INTEGER NOT NULL,
  notes TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Food entries table
CREATE TABLE IF NOT EXISTS food_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  bread_units REAL NOT NULL,
  carbs_grams REAL,
  description TEXT,
  timestamp INTEGER NOT NULL,
  notes TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insulin doses table
CREATE TABLE IF NOT EXISTS insulin_doses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  units REAL NOT NULL,
  insulin_type TEXT NOT NULL, -- 'rapid' | 'long' | 'mixed'
  timestamp INTEGER NOT NULL,
  linked_reading_id TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (linked_reading_id) REFERENCES glucose_readings(id) ON DELETE SET NULL
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY,
  glucose_unit TEXT NOT NULL DEFAULT 'mg/dL',
  target_glucose_min REAL DEFAULT 80,
  target_glucose_max REAL DEFAULT 120,
  theme TEXT DEFAULT 'light', -- 'light' | 'dark' | 'system'
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_glucose_user_time ON glucose_readings(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_food_user_time ON food_entries(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_insulin_user_time ON insulin_doses(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_glucose_linked_reading ON insulin_doses(linked_reading_id);
