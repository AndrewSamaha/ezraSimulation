import { describe, it, expect, vi } from 'vitest';
import Victor from 'victor';
import { findNearestNutrient } from '../organism';
import { SimulationObject, ObjectTypeEnum } from '@/context/SimulationContext';

describe('findNearestNutrient', () => {
  // Helper function to create test objects
  const createTestObject = (
    id: string, 
    type: ObjectTypeEnum, 
    x: number, 
    y: number
  ): SimulationObject => ({
    id,
    objectType: type,
    age: 0,
    vector: new Victor(x, y),
    velocity: new Victor(0, 0),
    forceInput: new Victor(0, 0),
    parentId: null,
    energy: 100,
    actionHistory: []
  });

  it('returns null when no nutrients exist', () => {
    const organism = createTestObject('org1', ObjectTypeEnum.ORGANISM, 10, 10);
    const allObjects = [
      organism,
      createTestObject('org2', ObjectTypeEnum.ORGANISM, 20, 20),
    ];

    const result = findNearestNutrient(organism, allObjects);
    expect(result).toBeNull();
  });

  it('finds the nearest nutrient from multiple options', () => {
    const organism = createTestObject('org1', ObjectTypeEnum.ORGANISM, 10, 10);
    
    const nearNutrient = createTestObject('nut1', ObjectTypeEnum.NUTRIENCE, 15, 15); // distance = ~7.07
    const farNutrient = createTestObject('nut2', ObjectTypeEnum.NUTRIENCE, 50, 50); // distance = ~56.57
    const mediumNutrient = createTestObject('nut3', ObjectTypeEnum.NUTRIENCE, 30, 30); // distance = ~28.28
    
    const allObjects = [
      organism,
      nearNutrient,
      farNutrient,
      mediumNutrient,
      createTestObject('org2', ObjectTypeEnum.ORGANISM, 5, 5),
    ];

    const result = findNearestNutrient(organism, allObjects);
    expect(result).not.toBeNull();
    expect(result?.id).toBe('nut1'); // Should find the closest nutrient
  });

  it('handles when organism is at the same position as a nutrient', () => {
    const organism = createTestObject('org1', ObjectTypeEnum.ORGANISM, 10, 10);
    const samePositionNutrient = createTestObject('nut1', ObjectTypeEnum.NUTRIENCE, 10, 10); // distance = 0
    const farNutrient = createTestObject('nut2', ObjectTypeEnum.NUTRIENCE, 50, 50);
    
    const allObjects = [
      organism,
      samePositionNutrient,
      farNutrient,
    ];

    const result = findNearestNutrient(organism, allObjects);
    expect(result).not.toBeNull();
    expect(result?.id).toBe('nut1'); // Should find the one at the same position
  });

  it('works correctly with a single nutrient', () => {
    const organism = createTestObject('org1', ObjectTypeEnum.ORGANISM, 10, 10);
    const nutrient = createTestObject('nut1', ObjectTypeEnum.NUTRIENCE, 20, 20);
    
    const allObjects = [
      organism,
      nutrient,
    ];

    const result = findNearestNutrient(organism, allObjects);
    expect(result).not.toBeNull();
    expect(result?.id).toBe('nut1');
  });
});
