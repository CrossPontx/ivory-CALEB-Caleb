-- Add auto-recharge settings to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_provider VARCHAR(50) DEFAULT 'stripe',
ADD COLUMN IF NOT EXISTS auto_recharge_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_recharge_amount INTEGER DEFAULT 5;

-- Add comment
COMMENT ON COLUMN users.auto_recharge_enabled IS 'Whether auto-recharge is enabled when credits hit 0';
COMMENT ON COLUMN users.auto_recharge_amount IS 'Number of credits to auto-recharge (5 or 10)';
COMMENT ON COLUMN users.subscription_provider IS 'Payment provider: stripe or apple';
