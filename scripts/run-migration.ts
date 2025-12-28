import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not found in environment');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function runMigration() {
  try {
    console.log('Running migration: add_auto_recharge_settings.sql');
    
    // Run each ALTER TABLE statement separately
    console.log('Adding subscription_provider column...');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_provider VARCHAR(50) DEFAULT 'stripe'`;
    
    console.log('Adding auto_recharge_enabled column...');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS auto_recharge_enabled BOOLEAN DEFAULT false`;
    
    console.log('Adding auto_recharge_amount column...');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS auto_recharge_amount INTEGER DEFAULT 5`;
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
