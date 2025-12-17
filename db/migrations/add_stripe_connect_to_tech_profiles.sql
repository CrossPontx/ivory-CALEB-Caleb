-- Add Stripe Connect fields to tech_profiles table
ALTER TABLE tech_profiles 
ADD COLUMN stripe_connect_account_id VARCHAR(255),
ADD COLUMN stripe_account_status VARCHAR(50) DEFAULT 'not_setup',
ADD COLUMN payouts_enabled BOOLEAN DEFAULT false,
ADD COLUMN charges_enabled BOOLEAN DEFAULT false;
