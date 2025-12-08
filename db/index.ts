import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import { env, validateEnv } from '@/lib/env';

// Validate environment variables on startup
validateEnv();

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });
