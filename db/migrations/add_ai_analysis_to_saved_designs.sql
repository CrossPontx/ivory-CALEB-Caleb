-- Add ai_analysis column to saved_designs table
ALTER TABLE saved_designs ADD COLUMN IF NOT EXISTS ai_analysis JSONB;

-- Add comment to explain the column
COMMENT ON COLUMN saved_designs.ai_analysis IS 'Cached AI analysis of the design including summary, nail shape, length, base color, design elements, finish, complexity level, and wearability';
