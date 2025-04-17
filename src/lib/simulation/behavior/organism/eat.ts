import { expressGene } from '@/lib/simulation/evolution/organism';
import { MemoryEngram } from '@/lib/simulation/types/SimulationObject';
import { SimulationObject } from '@/lib/simulation/types/SimulationObject';
import { MAX_BITE_SIZE, MIN_EATING_DISTANCE } from './constants';

interface eatingPriority {
  object: SimulationObject;
  distance: number;
  geneExpression: number;
  priority: number; // geneExpression / distance
}

export const shouldEat = (obj: SimulationObject, engrams: MemoryEngram[]) => {
  const engramsToEat: eatingPriority[] = engrams
    .reduce((acc, engram) => {
      const { object, distance } = engram;
      const { objectType } = object;
      if (distance > MIN_EATING_DISTANCE) return acc;
      const geneExpression = expressGene(obj.dna!, `${objectType}Eating`);
      const priority = geneExpression / distance;
      return [...acc, { object, distance, geneExpression, priority }];
    }, [] as eatingPriority[])
    .sort((a, b) => b.priority - a.priority);

  return engramsToEat.length > 0 ? engramsToEat[0].object : null;
};

export const getBiteSize = (obj: SimulationObject, target: SimulationObject) => {
  const biteSize = Math.min(MAX_BITE_SIZE, target.energy);
  return biteSize;
};
