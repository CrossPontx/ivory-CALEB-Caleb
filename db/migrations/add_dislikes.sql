-- Add dislike_count column to looks table
ALTER TABLE looks ADD COLUMN IF NOT EXISTS dislike_count INTEGER DEFAULT 0 NOT NULL;

-- Create dislikes table
CREATE TABLE IF NOT EXISTS dislikes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  look_id INTEGER NOT NULL REFERENCES looks(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, look_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dislikes_user_id ON dislikes(user_id);
CREATE INDEX IF NOT EXISTS idx_dislikes_look_id ON dislikes(look_id);
