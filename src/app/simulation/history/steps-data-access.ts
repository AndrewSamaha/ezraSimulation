'use server';

import { db } from '@/lib/db';
import { simulationSteps } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { cache } from 'react';

// Define the SimulationStep type based on our database schema
export type SimulationStep = {
  id: number;
  simulationId: string;
  stepNumber: number;
  stepData: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

// Get all steps for a specific simulation
export const getSimulationSteps = cache(async (simulationId: string): Promise<SimulationStep[]> => {
  try {
    const stepsData = await db
      .select()
      .from(simulationSteps)
      .where(eq(simulationSteps.simulationId, simulationId))
      .orderBy(asc(simulationSteps.stepNumber));

    return stepsData.map((step) => ({

      id: step.id,
      simulationId: step.simulationId ?? '', // Ensure simulationId is not null
      stepNumber: step.stepNumber,
      stepData: step.stepData || {},
      createdAt: step.createdAt || new Date(),
      updatedAt: step.updatedAt || new Date(),
    }));
  } catch (error) {
    console.error(`Error fetching steps for simulation ${simulationId}:`, error);
    return [];
  }
});
