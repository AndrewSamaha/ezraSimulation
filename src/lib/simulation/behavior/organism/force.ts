import Victor from 'victor';
import { expressGene } from '@/lib/simulation/evolution/organism';
import { type SimulationObject } from '@/lib/simulation/types/SimulationObject';
import { AFFINITY_FORCE_MULTIPLIER, MAX_FORCE } from './constants';

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
