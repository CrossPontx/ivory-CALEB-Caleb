-- Add likes table for tracking user likes on designs
CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  look_id INTEGER NOT NULL REFERENCES looks(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, look_id) -- Prevent duplicate likes
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_look_id ON likes(look_id);

-- Add like_count column to looks table
ALTER TABLE looks ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0 NOT NULL;
