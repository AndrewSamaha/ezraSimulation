import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Build connection string from environment variables
const getConnectionString = () => {
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const host = process.env.POSTGRES_HOST;
  const port = process.env.POSTGRES_PORT;
  const database = process.env.POSTGRES_DB;

  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
};

async function main() {
  console.log('Starting migration...');

  // Create a PostgreSQL connection pool
  const pool = new Pool({
    connectionString: getConnectionString(),
  });

  const db = drizzle(pool);

  // Run migrations
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: 'src/lib/db/migrations' });
  console.log('Migrations completed successfully!');

  // Close the pool
  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
