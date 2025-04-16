import Victor from 'victor';
import { v4 as uuid } from 'uuid';

import { SimulationObject, ObjectTypeEnum } from '@/lib/simulation/types/SimulationObject';
import { CONTAINER_WIDTH, CONTAINER_HEIGHT } from '@/lib/constants/world';
import { DNA, mutateDNA, isDNA } from '@/lib/simulation/evolution/organism';
import { expressGene } from '@/lib/simulation/evolution/organism';
import { ActionTypeEnum } from '@/lib/simulation/behavior/actions';

const MAX_ORGANISM = 50;
const MUTATION_RATE = 0.5;
const DEFAULT_ENERGY_GIFT = 30;
const RANDOM_SAMPLE_SIZE = 5;
const AFFINITY_FORCE_MULTIPLIER = 100;
const MAX_FORCE = 2;

export const createNewOrganism = (
  sampleSource: DNA | SimulationObject,
  mutationRate: number = MUTATION_RATE,
): SimulationObject => {
  const sampleDNA: DNA = isDNA(sampleSource)
    ? sampleSource
    : (sampleSource as SimulationObject).dna!;
  const position = new Victor(Math.random() * CONTAINER_WIDTH, Math.random() * CONTAINER_HEIGHT);
  const forceInput = new Victor(Math.random() * 20 - 10, Math.random() * 20 - 10).multiply(
    new Victor(0.2, 0.2),
  );
  const dna = mutateDNA(sampleDNA, mutationRate);
  const energy = isDNA(sampleSource)
    ? DEFAULT_ENERGY_GIFT
    : (sampleSource as SimulationObject).energy * expressGene(dna, 'energyGiftToOffspring');
  const id = uuid();
  // Create new organism with random position
  return {
    id,
    objectType: ObjectTypeEnum.ORGANISM,
    color: 'green',
    size: 10,
    age: 0,
    vector: position,
    velocity: new Victor(0, 0),
    forceInput: forceInput || new Victor(0, 0),
    parentId: isDNA(sampleSource) ? null : (sampleSource as SimulationObject).id,
    energy,
    actionHistory: [],
    dna,
    workingMemory: [],
  };
};

export const findNearestObject = (
  cur: SimulationObject,
  allObjects: SimulationObject[],
  objectType: ObjectTypeEnum,
) => {
  const filteredObjects = allObjects.filter((o) => o.objectType === objectType);
  if (filteredObjects.length === 0) {
    return null;
  }
  return filteredObjects.reduce((prev, curr) => {
    const distance = cur.vector.distance(curr.vector);
    return distance < cur.vector.distance(prev.vector) ? curr : prev;
  }, filteredObjects[0]);
};

// Keeping the original function for backward compatibility
export const findNearestNutrient = (cur: SimulationObject, allObjects: SimulationObject[]) => {
  return findNearestObject(cur, allObjects, ObjectTypeEnum.NUTRIENCE);
};

const shouldReproduce = (obj: SimulationObject, allObjects: SimulationObject[]) => {
  const organismCount = allObjects.filter((o) => o.objectType === ObjectTypeEnum.ORGANISM).length;

  if (organismCount >= MAX_ORGANISM) {
    return false;
  }
  if (obj.energy < expressGene(obj.dna!, 'minimumEnergyToReproduce')) {
    return false;
  }
  if (obj.age <= 20) {
    return false;
  }
  // FIX: This was backwards! Should return true when random value is LESS than probability
  // not false. Higher probability should mean MORE likely to reproduce.
  return Math.random() < expressGene(obj.dna!, 'reproductionProbability');
};

export const getRandomObjectSample = (
  cur: SimulationObject,
  allObjects: SimulationObject[],
  intendedSampleSize: number = RANDOM_SAMPLE_SIZE,
) => {
  const sampleSize = intendedSampleSize + 1;
  if (sampleSize >= allObjects.length) return allObjects.filter((o) => o.id !== cur.id);
  const sample: SimulationObject[] = [];
  while (sample.length < sampleSize) {
    const randomObject = allObjects[Math.floor(Math.random() * allObjects.length)];
    if (randomObject.id !== cur.id && !sample.includes(randomObject)) {
      sample.push(randomObject);
    }
  }
  return sample;
};

export const calcForceWithAffinity = (
  curVector: Victor,
  targetVector: Victor,
  affinityValue: number,
  forceMultiplier: number = AFFINITY_FORCE_MULTIPLIER,
) => {
  const affinityDistance = curVector.distance(targetVector);
  const normalizedTargetPosition = targetVector.subtract(curVector).normalize();
  const distanceSquared = affinityDistance * affinityDistance;
  const force = Math.min(MAX_FORCE, (forceMultiplier * affinityValue) / distanceSquared);
  const forceVector = normalizedTargetPosition.multiply(new Victor(force, force));
  return forceVector;
};

export const calcForce = (cur: SimulationObject, target: SimulationObject) => {
  const affinityValue = expressGene(cur.dna!, `${target.objectType}Affinity`);
  // CRITICAL FIX: Always clone vectors before passing them to force calculations
  // to prevent inadvertent modification of the original objects
  const curVector = cur.vector.clone();
  const targetVector = target.vector.clone();
  return calcForceWithAffinity(curVector, targetVector, affinityValue);
};

export const calcForceFromObjectArray = (cur: SimulationObject, objects: SimulationObject[]) => {
  const force = new Victor(0, 0);
  objects.forEach((obj) => {
    force.add(calcForce(cur, obj));
  });
  return force;
};

const shouldDie = (obj: SimulationObject) => {
  if (obj.energy <= 0) {
    return true;
  }
  return false;
};

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
  const force = calcForceFromObjectArray(obj, objectSample);

  // IMPORTANT: Don't directly assign the force to obj.forceInput as this modifies the original object
  // Instead, create a clone of the object with the modified values
  const updatedObj = {
    ...obj,
    forceInput: force.clone(), // Clone the force vector to avoid reference issues
  };

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
