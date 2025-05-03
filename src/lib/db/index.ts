import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// For client-side usage in a Next.js app
const getConnectionString = () => {
  // Build connection string from environment variables
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const host = process.env.POSTGRES_HOST;
  const port = process.env.POSTGRES_PORT;
  const database = process.env.POSTGRES_DB;

  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
};

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: getConnectionString(),
});

// Create a Drizzle ORM client
export const db = drizzle(pool, { schema });

// Export types
export type Simulation = typeof schema.simulations.$inferSelect;
export type SimulationInsert = typeof schema.simulations.$inferInsert;
export type SimulationStep = typeof schema.simulationSteps.$inferSelect;
export type SimulationStepInsert = typeof schema.simulationSteps.$inferInsert;

// Helper function to close the pool when the app is shutting down
export const closePool = async () => {
  await pool.end();
};
