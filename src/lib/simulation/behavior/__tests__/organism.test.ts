import { describe, it, expect } from 'vitest';
import Victor from 'victor';
import { findNearestNutrient, findNearestObject } from '../organism';
import { ObjectTypeEnum, SimulationObject } from '@/lib/simulation/types/SimulationObject';

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
  actionHistory: [],
  color: 'green',
  size: 10,
});

describe('findNearestNutrient', () => {
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

describe('findNearestObject', () => {
  it('returns null when no objects of specified type exist', () => {
    const organism = createTestObject('org1', ObjectTypeEnum.ORGANISM, 10, 10);
    const allObjects = [
      organism,
      createTestObject('org2', ObjectTypeEnum.ORGANISM, 20, 20),
    ];

    const result = findNearestObject(organism, allObjects, ObjectTypeEnum.NUTRIENCE);
    expect(result).toBeNull();
  });

  it('finds the nearest organism from multiple options', () => {
    const organism = createTestObject('org1', ObjectTypeEnum.ORGANISM, 10, 10);
    
    const nearOrganism = createTestObject('org2', ObjectTypeEnum.ORGANISM, 15, 15); // distance = ~7.07
    const farOrganism = createTestObject('org3', ObjectTypeEnum.ORGANISM, 50, 50); // distance = ~56.57
    const mediumOrganism = createTestObject('org4', ObjectTypeEnum.ORGANISM, 30, 30); // distance = ~28.28
    
    const allObjects = [
      organism,
      nearOrganism,
      farOrganism,
      mediumOrganism,
      createTestObject('nut1', ObjectTypeEnum.NUTRIENCE, 5, 5),
    ];

    // Don't include the current organism in the search
    const filteredObjects = allObjects.filter((obj) => obj.id !== organism.id);
    const result = findNearestObject(organism, filteredObjects, ObjectTypeEnum.ORGANISM);
    
    expect(result).not.toBeNull();
    expect(result?.id).toBe('org2'); // Should find the closest organism
  });

  it('finds nearest nutrient with new generic function', () => {
    const organism = createTestObject('org1', ObjectTypeEnum.ORGANISM, 10, 10);
    
    const nearNutrient = createTestObject('nut1', ObjectTypeEnum.NUTRIENCE, 15, 15); // distance = ~7.07
    const farNutrient = createTestObject('nut2', ObjectTypeEnum.NUTRIENCE, 50, 50); // distance = ~56.57
    
    const allObjects = [
      organism,
      nearNutrient,
      farNutrient,
      createTestObject('org2', ObjectTypeEnum.ORGANISM, 20, 20),
    ];

    const result = findNearestObject(organism, allObjects, ObjectTypeEnum.NUTRIENCE);
    expect(result).not.toBeNull();
    expect(result?.id).toBe('nut1'); // Should find the closest nutrient
  });

  it('handles finding an object at the same position', () => {
    const organism = createTestObject('org1', ObjectTypeEnum.ORGANISM, 10, 10);
    const samePositionOrganism = createTestObject('org2', ObjectTypeEnum.ORGANISM, 10, 10); // distance = 0
    const farOrganism = createTestObject('org3', ObjectTypeEnum.ORGANISM, 50, 50);
    
    const allObjects = [
      organism,
      samePositionOrganism,
      farOrganism,
    ];

    // Filter out the current organism from the search
    const filteredObjects = allObjects.filter((obj) => obj.id !== organism.id);
    const result = findNearestObject(organism, filteredObjects, ObjectTypeEnum.ORGANISM);
    
    expect(result).not.toBeNull();
    expect(result?.id).toBe('org2'); // Should find the one at the same position
  });
});
