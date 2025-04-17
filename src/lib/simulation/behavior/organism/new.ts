import { DNA, mutateDNA, isDNA } from '@/lib/simulation/evolution/organism';
import { SimulationObject, ObjectTypeEnum } from '@/lib/simulation/types/SimulationObject';
import { expressGene } from '@/lib/simulation/evolution/organism';
import { MUTATION_RATE, DEFAULT_ENERGY_GIFT } from './constants';
import { v4 as uuid } from 'uuid';
import Victor from 'victor';
import { CONTAINER_WIDTH, CONTAINER_HEIGHT } from '@/lib/constants/world';

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
