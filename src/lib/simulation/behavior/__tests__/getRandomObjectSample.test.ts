import { describe, it, expect, vi } from 'vitest';
import Victor from 'victor';
import { getRandomObjectSample } from '../organism';
import { SimulationObject, ObjectTypeEnum } from '@/context/SimulationContext';

// Helper function to create test objects
const createTestObject = (
  id: string, 
  type: ObjectTypeEnum, 
  x: number, 
  y: number,
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

describe('getRandomObjectSample', () => {
  it('returns all objects except current when sample size is greater than or equal to array length', () => {
    // Create current object
    const currentObject = createTestObject('current', ObjectTypeEnum.ORGANISM, 10, 10);
    
    // Create 9 additional objects (total of 10 including current)
    const allObjects = [
      currentObject,
      createTestObject('obj1', ObjectTypeEnum.ORGANISM, 20, 20),
      createTestObject('obj2', ObjectTypeEnum.ORGANISM, 30, 30),
      createTestObject('obj3', ObjectTypeEnum.ORGANISM, 40, 40),
      createTestObject('obj4', ObjectTypeEnum.NUTRIENCE, 50, 50),
      createTestObject('obj5', ObjectTypeEnum.NUTRIENCE, 60, 60),
      createTestObject('obj6', ObjectTypeEnum.ORGANISM, 70, 70),
      createTestObject('obj7', ObjectTypeEnum.ORGANISM, 80, 80),
      createTestObject('obj8', ObjectTypeEnum.NUTRIENCE, 90, 90),
      createTestObject('obj9', ObjectTypeEnum.ORGANISM, 100, 100),
    ];
    
    // Request all objects (sampleSize > allObjects.length)
    const result = getRandomObjectSample(currentObject, allObjects, 15);
    
    // Should return all objects except the current one
    expect(result.length).toBe(9);
    expect(result.find((obj) => obj.id === 'current')).toBeUndefined();
    expect(result.map((obj) => obj.id).sort()).toEqual([
      'obj1', 'obj2', 'obj3', 'obj4', 'obj5', 'obj6', 'obj7', 'obj8', 'obj9',
    ].sort());
  });
  
  it('returns objects of requested sample size when less than array length', () => {
    // Create current object
    const currentObject = createTestObject('current', ObjectTypeEnum.ORGANISM, 10, 10);
    
    // Create 9 additional objects (total of 10 including current)
    const allObjects = [
      currentObject,
      createTestObject('obj1', ObjectTypeEnum.ORGANISM, 20, 20),
      createTestObject('obj2', ObjectTypeEnum.ORGANISM, 30, 30),
      createTestObject('obj3', ObjectTypeEnum.ORGANISM, 40, 40),
      createTestObject('obj4', ObjectTypeEnum.NUTRIENCE, 50, 50),
      createTestObject('obj5', ObjectTypeEnum.NUTRIENCE, 60, 60),
      createTestObject('obj6', ObjectTypeEnum.ORGANISM, 70, 70),
      createTestObject('obj7', ObjectTypeEnum.ORGANISM, 80, 80),
      createTestObject('obj8', ObjectTypeEnum.NUTRIENCE, 90, 90),
      createTestObject('obj9', ObjectTypeEnum.ORGANISM, 100, 100),
    ];
    
    // Request 5 objects (the function will actually try to get 6 since it adds 1 to the intended size)
    const result = getRandomObjectSample(currentObject, allObjects, 5);
    
    // Should return exactly 6 objects
    expect(result.length).toBe(6);
    // Should not include the current object
    expect(result.find((obj) => obj.id === 'current')).toBeUndefined();
    // All returned objects should be from the original array
    result.forEach((obj) => {
      expect(allObjects.some((o) => o.id === obj.id)).toBe(true);
    });
  });
  
  it('does not include duplicates in the sample', () => {
    // Create current object
    const currentObject = createTestObject('current', ObjectTypeEnum.ORGANISM, 10, 10);
    
    // Create 9 additional objects (total of 10 including current)
    const allObjects = [
      currentObject,
      createTestObject('obj1', ObjectTypeEnum.ORGANISM, 20, 20),
      createTestObject('obj2', ObjectTypeEnum.ORGANISM, 30, 30),
      createTestObject('obj3', ObjectTypeEnum.ORGANISM, 40, 40),
      createTestObject('obj4', ObjectTypeEnum.NUTRIENCE, 50, 50),
      createTestObject('obj5', ObjectTypeEnum.NUTRIENCE, 60, 60),
      createTestObject('obj6', ObjectTypeEnum.ORGANISM, 70, 70),
      createTestObject('obj7', ObjectTypeEnum.ORGANISM, 80, 80),
      createTestObject('obj8', ObjectTypeEnum.NUTRIENCE, 90, 90),
      createTestObject('obj9', ObjectTypeEnum.ORGANISM, 100, 100),
    ];
    
    // Mock Math.random to ensure deterministic behavior for testing
    const originalRandom = Math.random;
    let callCount = 0;
    // Note duplicates at 0.1 and 0.2
    const mockRandomValues = [0.1, 0.2, 0.3, 0.1, 0.2, 0.4, 0.5, 0.6, 0.7]; 
    
    Math.random = vi.fn().mockImplementation(() => {
      return mockRandomValues[callCount++ % mockRandomValues.length];
    });
    
    try {
      const result = getRandomObjectSample(currentObject, allObjects, 5);
      
      // Should return exactly 6 objects despite duplicate random values
      expect(result.length).toBe(6);
      
      // Check for duplicates in the result
      const uniqueIds = new Set(result.map((obj) => obj.id));
      expect(uniqueIds.size).toBe(result.length);
      
      // Should not include the current object
      expect(result.find((obj) => obj.id === 'current')).toBeUndefined();
    } finally {
      // Restore the original Math.random function
      Math.random = originalRandom;
    }
  });
  
  it('works correctly when there are exactly enough objects for the sample', () => {
    // Create current object
    const currentObject = createTestObject('current', ObjectTypeEnum.ORGANISM, 10, 10);
    
    // Create 9 additional objects (total of 10 including current)
    const allObjects = [
      currentObject,
      createTestObject('obj1', ObjectTypeEnum.ORGANISM, 20, 20),
      createTestObject('obj2', ObjectTypeEnum.ORGANISM, 30, 30),
      createTestObject('obj3', ObjectTypeEnum.ORGANISM, 40, 40),
      createTestObject('obj4', ObjectTypeEnum.NUTRIENCE, 50, 50),
      createTestObject('obj5', ObjectTypeEnum.NUTRIENCE, 60, 60),
      createTestObject('obj6', ObjectTypeEnum.ORGANISM, 70, 70),
      createTestObject('obj7', ObjectTypeEnum.ORGANISM, 80, 80),
      createTestObject('obj8', ObjectTypeEnum.NUTRIENCE, 90, 90),
      createTestObject('obj9', ObjectTypeEnum.ORGANISM, 100, 100),
    ];
    
    // Request 9 objects (which is exactly how many are available after excluding current)
    const result = getRandomObjectSample(currentObject, allObjects, 8); // Function adds 1, so this becomes 9
    
    // Should return all 9 objects except current
    expect(result.length).toBe(9);
    expect(result.find((obj) => obj.id === 'current')).toBeUndefined();
  });

  it('does not return the current object', () => {
    const currentObject = createTestObject('current', ObjectTypeEnum.ORGANISM, 10, 10);
    const allObjects = [
      currentObject,
      createTestObject('obj1', ObjectTypeEnum.ORGANISM, 20, 20),
      createTestObject('obj2', ObjectTypeEnum.ORGANISM, 30, 30),
      createTestObject('obj3', ObjectTypeEnum.ORGANISM, 40, 40),
      createTestObject('obj4', ObjectTypeEnum.NUTRIENCE, 50, 50),
      createTestObject('obj5', ObjectTypeEnum.NUTRIENCE, 60, 60),
      createTestObject('obj6', ObjectTypeEnum.ORGANISM, 70, 70),
      createTestObject('obj7', ObjectTypeEnum.ORGANISM, 80, 80),
      createTestObject('obj8', ObjectTypeEnum.NUTRIENCE, 90, 90),
      createTestObject('obj9', ObjectTypeEnum.ORGANISM, 100, 100),
    ];
    const result = getRandomObjectSample(currentObject, allObjects, 5);
    expect(result.find((obj) => obj.id === 'current')).toBeUndefined();
  });
});
