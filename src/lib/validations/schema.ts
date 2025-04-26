import { z } from 'zod';

// Base schemas for common fields
const baseEntitySchema = z.object({
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Simulation object schema (matching the structure from SimulationContext)
export const simulationObjectSchema = z.object({
  id: z.string().uuid(),
  objectType: z.enum(['ORGANISM', 'NUTRIENCE']),
  vector: z.object({
    x: z.number(),
    y: z.number(),
  }),
  velocity: z.object({
    x: z.number(),
    y: z.number(),
  }),
  size: z.number(),
  color: z.string().optional(),
  age: z.number(),
  forceInput: z.object({
    x: z.number(),
    y: z.number(),
  }),
  parentId: z.string().uuid().nullable(),
  energy: z.number(),
  actionHistory: z.array(
    z.object({
      action: z.string(),
      stepNumber: z.number(),
      ref: z.record(z.union([z.string(), z.number()])).optional(),
    })
  ),
  dna: z.record(z.any()).optional(),
  workingMemory: z.array(z.record(z.any())),
  generation: z.number(),
});

// Simulation step schema (for a single step of simulation)
export const simulationStepSchema = z.object({
  objects: z.array(simulationObjectSchema),
});

// Performance metrics schema
export const performanceMetricsSchema = z.object({
  lastFrameDuration: z.number(),
  frameDurations: z.array(z.number()),
  fps: z.number(),
  totalOrganismCalculationTime: z.number(),
  organismCalculationTimes: z.array(z.number()),
  avgOrganismCalculationTime: z.number(),
  lastUpdateTimestamp: z.number(),
});

// Schema for simulation data (matching our database schema)
export const simulationSchema = baseEntitySchema.extend({
  id: z.string().uuid(),
  name: z.string().optional(),
  lastStep: z.number().default(0),
  configuration: z.record(z.unknown()).optional(),
});

// Schema for creating a new simulation
export const createSimulationSchema = z.object({
  name: z.string().min(1, "Simulation name is required"),
  initialStep: simulationStepSchema.optional(),
  config: z.record(z.unknown()).optional(),
});

// Schema for saving a simulation step
export const saveSimulationStepSchema = z.object({
  simulationId: z.string().uuid(),
  stepNumber: z.number().int().nonnegative(),
  stepData: simulationStepSchema,
});

// Schema for retrieving a simulation step
export const getSimulationStepSchema = z.object({
  simulationId: z.string().uuid(),
  stepNumber: z.number().int().nonnegative().optional(),
});

// Type definitions derived from the schemas
export type SimulationObject = z.infer<typeof simulationObjectSchema>;
export type SimulationStep = z.infer<typeof simulationStepSchema>;
export type PerformanceMetrics = z.infer<typeof performanceMetricsSchema>;
export type Simulation = z.infer<typeof simulationSchema>;
export type CreateSimulation = z.infer<typeof createSimulationSchema>;
export type SaveSimulationStep = z.infer<typeof saveSimulationStepSchema>;
export type GetSimulationStep = z.infer<typeof getSimulationStepSchema>;
