import { type SimulationObject } from '@/lib/simulation/types/SimulationObject';
import { WORKING_MEMORY_SIZE } from './constants';
import { MemoryEngram } from '@/lib/simulation/types/SimulationObject';

const createEngramsFromSample = (sample: SimulationObject[]) => {
  return sample.map((o) => ({
    object: o,
    distance: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }));
};

export const getNNearestEngrams = (
  obj: SimulationObject,
  sample: SimulationObject[],
  n: number,
) => {
  const newEngrams = sample.reduce((acc, o) => {
    acc.push({
      object: o,
      distance: obj.vector.distance(o.vector),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return acc;
  }, [] as MemoryEngram[]);
  return newEngrams.sort((a, b) => a.distance - b.distance).slice(0, n);
};

export const getNewWorkingMemory = (obj: SimulationObject, objectsInSample: SimulationObject[]) => {
  const sampleEngrams = createEngramsFromSample(objectsInSample);
  const memoryEngrams = obj.workingMemory.map((engram) => {
    if (sampleEngrams.find((s) => s.object.id === engram.object.id)) {
      return {
        ...engram,
        updatedAt: Date.now(),
      };
    }
    return engram;
  });

  const allEngrams = [...sampleEngrams, ...memoryEngrams];

  const uniqueEngrams = Array.from(new Set(allEngrams.map((engram) => engram.object)));

  const nearestEngrams = getNNearestEngrams(obj, uniqueEngrams, WORKING_MEMORY_SIZE);
  return nearestEngrams;
};
