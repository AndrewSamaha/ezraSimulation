import { type SimulationObject } from '@/lib/simulation/types/SimulationObject';
import { MAX_AGE } from './constants';

export const shouldDie = (obj: SimulationObject) => {
  if (obj.age >= MAX_AGE) {
    return true;
  }

  if (obj.energy <= 0) {
    return true;
  }
  return false;
};
