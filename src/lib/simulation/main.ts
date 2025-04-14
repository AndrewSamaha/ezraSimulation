import { SimulationObject, SimulationStep, ObjectTypeEnum } from '@/context/SimulationContext';

import { doPhysics } from './physics';
import { doNutrienceThings } from './behavior/nutrience';
import { doOrganismThings } from './behavior/organism';

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
  
  // Apply nutrience-specific behaviors
  (objects) => objects.reduce<SimulationObject[]>((acc, obj) => {
    // Process the object and possibly create new objects
    const result = doNutrienceThings(obj, objects);
    return [...acc, ...result];
  }, []),
  
  // Add more processors here as needed
];

/**
 * Calculates the next step in the simulation by running all processors in sequence
 */
export function calculateNextStep(currentStep: SimulationStep): { step: SimulationStep, metrics?: { frameDuration: number, organismCalculationTimes: number[] } } {
  // Start timing the frame
  const frameStartTime = performance.now();
  
  // Create metrics collector for organism calculations
  const metricsCollector: Record<string, number[]> = {
    organismCalculations: [],
  };
  
  // Modified organism processor to collect timing metrics
  const organismProcessor = (objects: SimulationObject[]): SimulationObject[] => {
    console.log('  organism processor');
    console.log('    input objects:');
    console.dir(objects);
    const newObjects = objects.reduce<SimulationObject[]>((acc, obj) => {
      if (obj.objectType === ObjectTypeEnum.ORGANISM) {
        const result = doOrganismThings(obj, objects, metricsCollector);
        if ('objects' in result) {
          return [...acc, ...result.objects];
        } else {
          console.log('No objects returned from doOrganismThings');
          return acc;
        }
      }
      
      // Process non-organism objects normally
      const result = doNutrienceThings(obj, objects);
      return [...acc, ...result];
    }, []);
    console.log('    output objects:');
    console.dir(newObjects);
    return newObjects;
  };
  
  // Define processors with our new organism processor
  const frameProcessors = [
    // Apply physics to all objects
    (objects: SimulationObject[]) => {
      console.log('  physics processor');
      console.log('    input objects:');
      console.dir(objects);
      const newObjects = objects.map(doPhysics);
      console.log('    output objects:');
      console.dir(newObjects);
      return newObjects;
    },
    
    // Apply behavior processors
    organismProcessor,
  ];
  
  // Run each processor in sequence, passing the results from one to the next
  const newObjects = frameProcessors.reduce(
    (objects, processor) => processor(objects),
    currentStep.objects,
  );
  
  // Calculate frame duration
  const frameDuration = performance.now() - frameStartTime;
  
  // Return a new step with the updated objects and metrics
  return {
    step: {
      objects: newObjects,
    },
    metrics: {
      frameDuration,
      organismCalculationTimes: metricsCollector.organismCalculations,
    },
  };
}
  