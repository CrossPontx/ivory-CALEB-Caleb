const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function addAiAnalysisColumn() {
  console.log('🚀 Adding ai_analysis column to saved_designs table...\n');
  
  try {
    // Add ai_analysis column to saved_designs table
    await sql`
      ALTER TABLE saved_designs 
      ADD COLUMN IF NOT EXISTS ai_analysis JSONB
    `;
    console.log('✓ Added ai_analysis column to saved_designs table');

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

addAiAnalysisColumn();
