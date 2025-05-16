import { type SimulationObject } from '@/lib/simulation/types/SimulationObject';
import { ObjectTypeEnum } from '@/lib/simulation/types/SimulationObject';
import { expressGene } from '@/lib/simulation/evolution/organism';
import { MAX_ORGANISM } from './constants';

export const shouldReproduce = (obj: SimulationObject, allObjects: SimulationObject[]) => {
  const organismCount = allObjects.filter((o) => o.objectType === ObjectTypeEnum.ORGANISM).length;

  if (organismCount >= MAX_ORGANISM) {
    console.log(`no babies, too many babies (${organismCount} >= ${MAX_ORGANISM})`);
    return false;
  }
  if (obj.energy < expressGene(obj.dna!, 'minimumEnergyToReproduce')) {
    return false;
  }
  if (obj.age <= 100) {
    return false;
  }
  // FIX: This was backwards! Should return true when random value is LESS than probability
  // not false. Higher probability should mean MORE likely to reproduce.
  return Math.random() < expressGene(obj.dna!, 'reproductionProbability');
};

export const numBabiesToMake = (obj: SimulationObject, allObjects: SimulationObject[]) => {
  const organismCount = allObjects.filter((o) => o.objectType === ObjectTypeEnum.ORGANISM).length;
  if (organismCount >= MAX_ORGANISM) {
    console.log(`no babies, too many babies (${organismCount} >= ${MAX_ORGANISM})`);
    return 0;
  }
  if (obj.energy < expressGene(obj.dna!, 'minimumEnergyToReproduce') * 2) {
    return 0;
  }
  if (obj.age <= 100) {
    return 0;
  }
  if (Math.random() > expressGene(obj.dna!, 'reproductionProbability')) {
    return 0;
  }
  return 2;
};
