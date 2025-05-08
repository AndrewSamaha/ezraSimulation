import { pgTable, text, timestamp, serial, integer, json, primaryKey, uuid } from 'drizzle-orm/pg-core';

// Simulations table - stores information about each simulation
export const simulations = pgTable('simulations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastStep: integer('last_step').default(0),
  configuration: json('configuration').$type<Record<string, unknown>>(),
});

// Simulation steps table - stores the data for each step of a simulation
export const simulationSteps = pgTable('simulation_steps', {
  id: serial('id').primaryKey(),
  simulationId: uuid('simulation_id').references(() => simulations.id, { onDelete: 'cascade' }),
  stepNumber: integer('step_number').notNull(),
  stepData: json('step_data').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Performance metrics table - optional, for tracking performance data for each step
export const performanceMetrics = pgTable('performance_metrics', {
  id: serial('id').primaryKey(),
  simulationId: uuid('simulation_id').references(() => simulations.id, { onDelete: 'cascade' }),
  stepNumber: integer('step_number').notNull(),
  frameDuration: integer('frame_duration'),
  organismCalculationTime: integer('organism_calculation_time'),
  fps: integer('fps'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Combined unique constraints
export const stepUniqueIndex = pgTable('step_unique_index', {
  simulationId: uuid('simulation_id').references(() => simulations.id, { onDelete: 'cascade' }),
  stepNumber: integer('step_number').notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.simulationId, table.stepNumber] }),
  };
});
