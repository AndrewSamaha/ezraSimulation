'use server';

import { db } from '@/lib/db';
import { simulations } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { Simulation } from './columns';
import { cache } from 'react';

// Use React's cache function to deduplicate requests
export const getSimulations = cache(async (): Promise<Simulation[]> => {
  try {
    const simulationsData = await db
      .select()
      .from(simulations)
      .orderBy(desc(simulations.createdAt));

    return simulationsData.map((sim) => ({
      id: sim.id,
      name: sim.name || '',
      createdAt: sim.createdAt || new Date(),
      updatedAt: sim.updatedAt || new Date(),
      lastStep: sim.lastStep || 0,
      configuration: sim.configuration || {},
    }));
  } catch (error) {
    console.error('Error fetching simulations:', error);
    return [];
  }
});

// Get a single simulation by ID
export const getSimulationById = cache(async (id: string): Promise<Simulation | null> => {
  try {
    const simulationData = await db
      .select()
      .from(simulations)
      .where(eq(simulations.id, id))
      .limit(1);

    if (simulationData.length === 0) {
      return null;
    }

    const sim = simulationData[0];
    return {
      id: sim.id,
      name: sim.name || '',
      createdAt: sim.createdAt || new Date(),
      updatedAt: sim.updatedAt || new Date(),
      lastStep: sim.lastStep || 0,
      configuration: sim.configuration || {},
    };
  } catch (error) {
    console.error(`Error fetching simulation with ID ${id}:`, error);
    return null;
  }
});
