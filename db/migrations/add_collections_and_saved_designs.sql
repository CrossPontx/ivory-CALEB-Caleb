-- Add collections table for organizing saved designs
CREATE TABLE IF NOT EXISTS collections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add saved_designs table for uploaded and shared designs
CREATE TABLE IF NOT EXISTS saved_designs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  collection_id INTEGER REFERENCES collections(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  title VARCHAR(255),
  source_url TEXT,
  source_type VARCHAR(50),
  notes TEXT,
  tags JSONB,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_designs_user_id ON saved_designs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_designs_collection_id ON saved_designs(collection_id);
CREATE INDEX IF NOT EXISTS idx_saved_designs_created_at ON saved_designs(created_at DESC);

-- Create default "Your Designs" collection for existing users
INSERT INTO collections (user_id, name, description, is_default)
SELECT id, 'Your Designs', 'Your uploaded and saved nail designs', true
FROM users
WHERE user_type = 'client'
ON CONFLICT DO NOTHING;
