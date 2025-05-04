'use server';

import { cache } from 'react';
import { getSimulationSteps } from './steps-data-access';

// Define the SimulationOrganism type
export type SimulationOrganism = {
  id: string;
  type: string;
  firstSeen: number; // first step where organism appeared
  lastSeen: number; // last step where organism was observed
  occurrences: number; // number of steps this organism appeared in
  position?: { x: number; y: number }; // last known position
  size?: number; // last known size
  color?: string; // last known color
  energy?: number; // last known energy
  age?: number; // last known age
  // Additional metadata
  [key: string]: unknown;
};

// Extract unique organisms from simulation steps
export const getSimulationOrganisms = cache(
  async (simulationId: string): Promise<SimulationOrganism[]> => {
    try {
      // Get all steps for the simulation
      const steps = await getSimulationSteps(simulationId);
      console.log(`steps.length=${steps.length}`);
      if (!steps.length) {
        return [];
      }

      // Map to track organisms across steps
      const organismMap = new Map<string, SimulationOrganism>();

      // Process each step to extract organisms
      steps.forEach((step) => {
        const stepData = step.stepData as any;
        const stepNumber = step.stepNumber;

        // Extract organisms from the stepData
        // This depends on your simulation data structure
        const organisms = extractOrganismsFromStep(stepData, stepNumber);

        // Update organism map with data from this step
        organisms.forEach((organism) => {
          const existingOrganism = organismMap.get(organism.id);

          if (existingOrganism) {
            // Update existing organism data
            organismMap.set(organism.id, {
              ...existingOrganism,
              lastSeen: stepNumber,
              occurrences: existingOrganism.occurrences + 1,
              position: organism.position || existingOrganism.position,
              size: organism.size || existingOrganism.size,
              color: organism.color || existingOrganism.color,
              energy: organism.energy || existingOrganism.energy,
              age: organism.age || existingOrganism.age,
              // Keep any additional properties
              ...Object.entries(organism)
                .filter(
                  ([key]) =>
                    ![
                      'id',
                      'type',
                      'firstSeen',
                      'lastSeen',
                      'occurrences',
                      'position',
                      'size',
                      'color',
                      'energy',
                      'age',
                    ].includes(key),
                )
                .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}),
            });
          } else {
            // Add new organism to map
            organismMap.set(organism.id, {
              ...organism,
              firstSeen: stepNumber,
              lastSeen: stepNumber,
              occurrences: 1,
            });
          }
        });
      });

      // Convert map to array
      return Array.from(organismMap.values());
    } catch (error) {
      console.error(`Error extracting organisms for simulation ${simulationId}:`, error);
      return [];
    }
  },
);

// Helper function to extract organisms from a step's data
function extractOrganismsFromStep(stepData: any, stepNumber: number): SimulationOrganism[] {
  const organisms: SimulationOrganism[] = [];

  const organismArray = stepData.objects; //.find((arr) => Array.isArray(arr));
  if (organismArray) {
    organismArray.forEach((org: any) => {
      if (org && org.id) {
        organisms.push({
          id: org.id,
          type: org.type || 'organism',
          firstSeen: stepNumber,
          lastSeen: stepNumber,
          occurrences: 1,
          position: org.position || org.coordinates || undefined,
          size: org.size || org.radius || undefined,
          color: org.color || undefined,
          energy: org.energy || undefined,
          age: org.age || undefined,
          // Copy any other properties
          ...Object.entries(org)
            .filter(
              ([key]) =>
                ![
                  'id',
                  'type',
                  'position',
                  'coordinates',
                  'size',
                  'radius',
                  'color',
                  'energy',
                  'age',
                ].includes(key),
            )
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}),
        });
      }
    });
  }

  return organisms;
}
