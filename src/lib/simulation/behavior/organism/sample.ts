import { type SimulationObject } from '@/lib/simulation/types/SimulationObject';
import { ObjectTypeEnum } from '@/lib/simulation/types/SimulationObject';
import { expressGene } from '@/lib/simulation/evolution/organism';
import { RANDOM_SAMPLE_SIZE, MAX_ORGANISM } from './constants';

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

export const shouldReproduce = (obj: SimulationObject, allObjects: SimulationObject[]) => {
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
