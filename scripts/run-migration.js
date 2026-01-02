const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  console.log('🚀 Running collections migration...\n');
  
  try {
    // Create collections table
    await sql`
      CREATE TABLE IF NOT EXISTS collections (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✓ Created collections table');

    // Create saved_designs table
    await sql`
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
      )
    `;
    console.log('✓ Created saved_designs table');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id)`;
    console.log('✓ Created index on collections.user_id');

    await sql`CREATE INDEX IF NOT EXISTS idx_saved_designs_user_id ON saved_designs(user_id)`;
    console.log('✓ Created index on saved_designs.user_id');

    await sql`CREATE INDEX IF NOT EXISTS idx_saved_designs_collection_id ON saved_designs(collection_id)`;
    console.log('✓ Created index on saved_designs.collection_id');

    await sql`CREATE INDEX IF NOT EXISTS idx_saved_designs_created_at ON saved_designs(created_at DESC)`;
    console.log('✓ Created index on saved_designs.created_at');

    // Create default collections for existing client users
    const result = await sql`
      INSERT INTO collections (user_id, name, description, is_default)
      SELECT id, 'Your Designs', 'Your uploaded and saved nail designs', true
      FROM users
      WHERE user_type = 'client'
      AND id NOT IN (SELECT user_id FROM collections WHERE is_default = true)
    `;
    console.log(`✓ Created default collections for ${result.length} users`);

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
