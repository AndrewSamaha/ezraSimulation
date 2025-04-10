import Victor from 'victor';
import { v4 as uuid } from 'uuid';

import { SimulationObject } from '@/context/SimulationContext';
import { ObjectTypeEnum } from '@/context/SimulationContext';
import { CONTAINER_WIDTH, CONTAINER_HEIGHT } from '@/lib/constants/world';
import { DNA, mutateDNA, isDNA } from '@/lib/simulation/evolution/organism';
import { expressGene } from '@/lib/simulation/evolution/organism';
import { ActionTypeEnum } from '@/lib/simulation/behavior/actions';

const MAX_ORGANISM = 50;
const MUTATION_RATE = 0.5;
const DEFAULT_ENERGY_GIFT = 100;
const RANDOM_SAMPLE_SIZE = 5;

export const createNewOrganism = (sampleSource: DNA | SimulationObject, mutationRate: number = MUTATION_RATE): SimulationObject => {
  const sampleDNA: DNA = isDNA(sampleSource) ? sampleSource : (sampleSource as SimulationObject).dna!;
  const position = isDNA(sampleSource) ? new Victor(Math.random() * CONTAINER_WIDTH, Math.random() * CONTAINER_HEIGHT) : (sampleSource as SimulationObject).vector;
  const forceInput = new Victor(Math.random() * 20 - 10, Math.random() * 20 - 10).multiply(new Victor(.2, .2));
  const dna = mutateDNA(sampleDNA, mutationRate);
  const energy = isDNA(sampleSource) ? DEFAULT_ENERGY_GIFT : (sampleSource as SimulationObject).energy * expressGene(dna, 'energyGiftToOffspring');
  return {
    id: uuid(),
    objectType: ObjectTypeEnum.ORGANISM,
    color: 'green',
    size: 10,
    age: 0,
    vector: position,
    velocity: new Victor(0, 0),
    forceInput,
    parentId: isDNA(sampleSource) ? null : (sampleSource as SimulationObject).id,
    energy,
    actionHistory: [],
    dna,
  };
};

export const findNearestObject = (cur: SimulationObject, allObjects: SimulationObject[], objectType: ObjectTypeEnum) => {
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
  if (Math.random() < expressGene(obj.dna!, 'reproductionProbability')) {
    return false;
  }
  return true;
};

// Should we create vectors for just the nearest things, or all the things?
const createAffinityVector = (cur: SimulationObject, target: SimulationObject) => {
  const nearest = findNearestObject(cur, [target], target.objectType);
  if (!nearest) {
    return new Victor(0, 0);
  }
  return nearest.vector.subtract(cur.vector);
};

export const getRandomObjectSample = (cur: SimulationObject, allObjects: SimulationObject[], intendedSampleSize: number = RANDOM_SAMPLE_SIZE) => {
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

export const calcForce = (cur: SimulationObject, target: SimulationObject) => {
  const affinityValue = expressGene(cur.dna!, `${target.objectType}Affinity`);
  const affinityDistance = cur.vector.distance(target.vector);
  const normalizedTargetPosition = cur.vector.subtract(target.vector).normalize();
  const distanceSquared = affinityDistance * affinityDistance;
  const force = affinityValue / distanceSquared;
  const forceVector = normalizedTargetPosition.multiply(new Victor(force, force));
  return forceVector;
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
): SimulationObject[] | { objects: SimulationObject[], duration: number } {
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

  const objectSample = getRandomObjectSample(obj, allObjects);

  if (shouldReproduce(obj, allObjects)) {
    const newOrganism = createNewOrganism(obj);
    const lostEnergy = newOrganism.energy;
    obj.energy -= lostEnergy;
    obj.actionHistory.unshift(ActionTypeEnum.REPRODUCE);
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
