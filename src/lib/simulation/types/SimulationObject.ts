import Victor from 'victor';
import { DNA } from '../evolution/organism'; // Adjust import if needed
import { ActionType } from '../behavior/actions'; // Adjust import if needed

export enum ObjectTypeEnum {
  ORGANISM = 'organism',
  NUTRIENCE = 'nutrience',
}

export const ObjectTypes = [ObjectTypeEnum.ORGANISM, ObjectTypeEnum.NUTRIENCE] as const;
export type ObjectType = (typeof ObjectTypes)[number];

export interface SimulationObject {
  id: string;
  objectType: ObjectType;
  color?: string;
  size?: number;
  age: number;
  vector: Victor;
  velocity: Victor;
  forceInput: Victor;
  parentId: string | null;
  energy: number;
  actionHistory: ActionType[];
  dna?: DNA;
  workingMemory: MemoryEngram[];
}

export interface MemoryEngram {
  createdAt: number; // datetime stamp
  updatedAt: number;
  object: SimulationObject;
}

export interface SimulationStep {
  objects: SimulationObject[];
}

export interface PerformanceMetrics {
  lastFrameDuration: number;
  frameDurations: number[];
  fps: number;
  totalOrganismCalculationTime: number;
  organismCalculationTimes: number[];
  avgOrganismCalculationTime: number;
  detailedMetrics?: { [key: string]: number[] };
  lastUpdateTimestamp: number;
}
