-- Add AI analysis field to looks table
ALTER TABLE looks ADD COLUMN IF NOT EXISTS ai_analysis JSONB;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_looks_ai_analysis ON looks USING GIN (ai_analysis);
