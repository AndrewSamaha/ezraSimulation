'use server';

import { db } from '@/lib/db';
import { simulations, simulationSteps } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Deletes simulations by their IDs and related data
 * @param ids Array of simulation IDs to delete
 * @returns Object indicating success and any error message
 */
export async function deleteSimulations(ids: string[]): Promise<{ success: boolean; message?: string }> {
  try {
    // Input validation
    if (!ids || ids.length === 0) {
      return { success: false, message: 'No simulation IDs provided' };
    }

    // Start a transaction to ensure all related data is deleted correctly
    await db.transaction(async (tx) => {
      // First delete all simulation steps for these simulations
      await tx
        .delete(simulationSteps)
        .where(inArray(simulationSteps.simulationId, ids));

      // Then delete the simulations themselves
      await tx
        .delete(simulations)
        .where(inArray(simulations.id, ids));
    });

    // Revalidate the history page to refresh the data
    revalidatePath('/simulation/history');

    return { 
      success: true,
      message: `Successfully deleted ${ids.length} simulation(s)`
    };
  } catch (error) {
    console.error('Error deleting simulations:', error);
    return { 
      success: false, 
      message: `Error deleting simulations: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
