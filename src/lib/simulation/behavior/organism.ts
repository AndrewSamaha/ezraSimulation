import Victor from 'victor';
import { v4 as uuid } from 'uuid';

import { SimulationObject } from '@/context/SimulationContext';
import { ObjectTypeEnum } from '@/context/SimulationContext';
import { CONTAINER_WIDTH, CONTAINER_HEIGHT } from '@/lib/constants/world';
import { DNA, mutateDNA, isDNA } from '@/lib/simulation/evolution/organism';
import { expressGene } from '@/lib/simulation/evolution/organism';
import { ActionTypeEnum } from '@/lib/simulation/behavior/actions';

const MAX_ORGANISM = 50;
const MUTATION_RATE = 0.5
const DEFAULT_ENERGY_GIFT = 100;

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
    dna
  };
};

const findNearestNutrient = (cur: SimulationObject, allObjects: SimulationObject[]) => {
  const nutrients = allObjects.filter(o => o.objectType === ObjectTypeEnum.NUTRIENCE);
  if (nutrients.length === 0) {
    return null;
  }
  return nutrients.reduce((prev, curr) => {
    const distance = cur.vector.distance(curr.vector);
    return distance < prev.vector.distance(curr.vector) ? curr : prev;
  }, nutrients[0]);
}

const shouldReproduce = (obj: SimulationObject, allObjects: SimulationObject[]) => {
  const organismCount = allObjects.filter(o => o.objectType === ObjectTypeEnum.ORGANISM).length;

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
}

/**
 * Apply nutrience-specific behaviors and return an array that can contain the original object
 * plus any new objects created (e.g., reproduction, spawning resources, etc.)
 * 
 * @param obj The nutrience object to process
 * @param allObjects All objects in the current simulation step (for contextual behaviors)
 * @returns Array of objects including the processed object and any new objects
 */
export function doOrganismThings(
  obj: SimulationObject, 
  allObjects: SimulationObject[]
): SimulationObject[] {
  // Skip non-organism objects
  if (obj.objectType !== ObjectTypeEnum.ORGANISM) {
    return [obj];
  }
  
  const dna = obj.dna!;

  if (!dna) {
    throw new Error('Organism must have DNA');
  }

  const returnArray: SimulationObject[] = [];

  

  const shouldDie = () => {
    if (obj.energy <= 0) {
      return true;
    }
    return false;
  }



  if (shouldDie()) {
    return returnArray;
  }

  if (shouldReproduce(obj, allObjects)) {
    const newOrganism = createNewOrganism(obj);
    const lostEnergy = newOrganism.energy;
    obj.energy -= lostEnergy;
    obj.actionHistory.unshift(ActionTypeEnum.REPRODUCE);
    returnArray.push(newOrganism);
  }

  

  return returnArray;
}
