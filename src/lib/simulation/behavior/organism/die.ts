import { type SimulationObject } from '@/lib/simulation/types/SimulationObject';

export const shouldDie = (obj: SimulationObject) => {
  if (obj.energy <= 0) {
    return true;
  }
  return false;
};
