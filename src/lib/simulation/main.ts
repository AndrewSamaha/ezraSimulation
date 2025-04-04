import { SimulationObject, SimulationStep } from '@/context/SimulationContext';

import { doPhysics } from './physics';
import { doPlantThings } from './behavior/plant';

/**
 * Type definition for simulation processors
 * Each processor can transform the array of simulation objects by adding, removing, or modifying objects
 */
export type SimulationProcessor = (objects: SimulationObject[]) => SimulationObject[];

/**
 * List of processors to run in sequence
 * Each processor can transform the entire array of objects
 */
const simulationProcessors: SimulationProcessor[] = [
  // Apply physics to all objects
  (objects) => objects.map(doPhysics),
  
  // Apply plant-specific behaviors
  (objects) => objects.reduce<SimulationObject[]>((acc, obj) => {
    // Process the object and possibly create new objects
    const result = doPlantThings(obj, objects);
    return [...acc, ...result];
  }, []),
  
  // Add more processors here as needed
];

/**
 * Calculates the next step in the simulation by running all processors in sequence
 */
export function calculateNextStep(currentStep: SimulationStep): SimulationStep {
  // Run each processor in sequence, passing the results from one to the next
  const newObjects = simulationProcessors.reduce(
    (objects, processor) => processor(objects),
    currentStep.objects
  );
  
  // Return a new step with the updated objects
  return {
    objects: newObjects
  };
}
  