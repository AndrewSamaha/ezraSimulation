import Victor from 'victor';
import { v4 as uuid } from 'uuid';

import { SimulationObject } from '@/context/SimulationContext';
import { ObjectTypeEnum } from '@/context/SimulationContext';
import { CONTAINER_WIDTH, CONTAINER_HEIGHT } from '@/lib/constants/world';

const MAX_PLANTS = 50;

export const createNewPlant = (parent?: SimulationObject): SimulationObject => {
  if (!parent) {
    return {
      id: uuid(),
      objectType: ObjectTypeEnum.PLANT,
      color: 'green',
      size: 10,
      age: 0,
      vector: new Victor(Math.random() * CONTAINER_WIDTH, Math.random() * CONTAINER_HEIGHT),
      velocity: new Victor(0, 0),
      forceInput: new Victor(0, 0),
      parentId: null
    };
  }

  const newPosition = parent.vector.clone().add(new Victor(Math.random() * 20 - 10, Math.random() * 20 - 10));
  const forceAwayFromParent = new Victor(newPosition.x - parent.vector.x, newPosition.y - parent.vector.y).multiply(new Victor(.2, .2));

  return {
    id: uuid(),
    objectType: ObjectTypeEnum.PLANT,
    color: parent.color,
    size: parent.size,
    age: 0,
    vector: newPosition,
    velocity: parent.velocity.clone(),
    forceInput: forceAwayFromParent,
    parentId: parent.id
  };
};

/**
 * Apply plant-specific behaviors and return an array that can contain the original object
 * plus any new objects created (e.g., reproduction, spawning resources, etc.)
 * 
 * @param obj The plant object to process
 * @param allObjects All objects in the current simulation step (for contextual behaviors)
 * @returns Array of objects including the processed object and any new objects
 */
export function doPlantThings(
  obj: SimulationObject, 
  allObjects: SimulationObject[]
): SimulationObject[] {
  // Skip non-plant objects
  if (obj.objectType !== ObjectTypeEnum.PLANT) {
    return [obj];
  }

  const returnArray = [];

  const shouldReproduce = () => {
    const plantCount = allObjects.filter(o => o.objectType === ObjectTypeEnum.PLANT).length;
    if (plantCount >= MAX_PLANTS) {
      return false;
    }
    if (obj.age <= 20) {
      return false;
    }
    if (Math.random() < 0.95) {
      return false;
    }
    return true;
  }

  const shouldSurvive = () => {
    if (obj.age <= 200) {
      return true;
    }
    if (Math.random() < 0.995) {
      return true;
    }

    return false;
  }

  if (shouldReproduce()) {
    returnArray.push(createNewPlant(obj));
  }

  if (shouldSurvive()) {
    returnArray.push(obj);
  }

  return returnArray;
}
