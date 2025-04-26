import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

export default {
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'localhost',
    port: Number(process.env.POSTGRES_PORT || 54322),
    user: process.env.POSTGRES_USER || 'ezra',
    password: process.env.POSTGRES_PASSWORD || 'simulationpassword',
    database: process.env.POSTGRES_DB || 'ezra_simulation',
  },
} satisfies Config;
