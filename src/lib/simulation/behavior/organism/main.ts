import Victor from 'victor';

import { SimulationObject, ObjectTypeEnum } from '@/lib/simulation/types/SimulationObject';
import { ActionTypeEnum } from '@/lib/simulation/behavior/actions';
import { calcForceFromObjectArray } from './force';
import { getRandomObjectSample } from './sample';
import { shouldReproduce } from './reproduce';
import { shouldDie } from './die';
import { getNewWorkingMemory } from './memory';
import { createNewOrganism } from './new';
import { getBiteSize, shouldEat } from './eat';

/**
 * Apply nutrience-specific behaviors and return an array that can contain the original object
 * plus any new objects created (e.g., reproduction, spawning resources, etc.)
 *
 * @param obj The nutrience object to process
 * @param allObjects All objects in the current simulation step (for contextual behaviors)
 * @param metricsCollector Optional object to collect performance metrics
 * @returns Array of objects including the processed object and any new objects, and duration if metricsCollector provided
 */
export function doOrganismThings(
  obj: SimulationObject,
  allObjects: SimulationObject[],
  metricsCollector?: Record<string, number[]>,
): SimulationObject[] | { objects: SimulationObject[]; duration: number } {
  // Start timing
  const startTime = performance.now();

  // Skip non-organism objects
  if (obj.objectType !== ObjectTypeEnum.ORGANISM) {
    // Even for skipped objects, return in the expected format if metrics are requested
    if (metricsCollector) {
      return { objects: [obj], duration: 0 };
    }
    return [obj];
  }

  const dna = obj.dna!;

  if (!dna) {
    throw new Error('Organism must have DNA');
  }

  const returnArray: SimulationObject[] = [];

  if (shouldDie(obj)) {
    // Calculate duration before returning
    if (metricsCollector) {
      const duration = performance.now() - startTime;
      if (!metricsCollector.organismCalculations) {
        metricsCollector.organismCalculations = [];
      }
      metricsCollector.organismCalculations.push(duration);
      return { objects: returnArray, duration };
    }
    return returnArray;
  }
  returnArray.push(obj);

  // Create random sample of objects to calculate forces from
  const objectSample = getRandomObjectSample(obj, allObjects);

  // Calculate force vector based on surrounding objects
  const force = obj.energy > 10 ? calcForceFromObjectArray(obj, objectSample) : new Victor(0, 0);
  const forceCost = force.lengthSq() + 0.2;

  const updatedObj = {
    ...obj,
    forceInput: force.clone(),
    workingMemory: getNewWorkingMemory(obj, objectSample),
    energy: obj.energy - forceCost,
  };

  const foodTargetNearby = shouldEat(obj, updatedObj.workingMemory);
  if (foodTargetNearby) {
    const biteSize = getBiteSize(obj, foodTargetNearby);
    console.log(`biteSize: ${biteSize}`);
    updatedObj.energy += biteSize;
    foodTargetNearby.energy -= biteSize;
  }

  // Replace the original object in our return array
  const originalIndex = returnArray.indexOf(obj);
  if (originalIndex !== -1) {
    returnArray[originalIndex] = updatedObj;
  } else {
    // If not found (shouldn't happen, but just in case)
    returnArray.push(updatedObj);
    // This shouldn't happen, but we handle it anyway
  }

  // IMPORTANT: Use the updated object instead of the original
  const currentObj = returnArray.find((o) => o.id === obj.id) || obj;

  if (shouldReproduce(currentObj, allObjects)) {
    // Create new organism with a completely independent set of vectors
    const newOrganism = createNewOrganism(currentObj);
    const lostEnergy = newOrganism.energy;

    // Create a new updated object with reduced energy and updated action history
    // instead of modifying the original
    const updatedAfterReproduction = {
      ...currentObj,
      energy: currentObj.energy - lostEnergy,
      actionHistory: [ActionTypeEnum.REPRODUCE, ...currentObj.actionHistory],
      // Make sure we clone these vectors to avoid any reference issues
      vector: currentObj.vector.clone(),
      velocity: currentObj.velocity.clone(),
      forceInput: currentObj.forceInput.clone(),
    };

    // Replace the current object in the return array
    const currentIndex = returnArray.indexOf(currentObj);
    if (currentIndex !== -1) {
      returnArray[currentIndex] = updatedAfterReproduction;
    }

    // Add the new organism to the return array
    returnArray.push(newOrganism);
  }

  // Calculate duration before final return
  if (metricsCollector) {
    const duration = performance.now() - startTime;
    if (!metricsCollector.organismCalculations) {
      metricsCollector.organismCalculations = [];
    }
    metricsCollector.organismCalculations.push(duration);

    return { objects: returnArray, duration };
  }

  return returnArray;
}
