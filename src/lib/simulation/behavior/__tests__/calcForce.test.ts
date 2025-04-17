import { describe, it, expect } from 'vitest';
import Victor from 'victor';
import { calcForce, calcForceWithAffinity } from '../organism/main';
import { ObjectTypeEnum, SimulationObject } from '@/lib/simulation/types/SimulationObject';
import { HERBIVORE_DNA_TEMPLATE } from '@/lib/simulation/evolution/organism';

// Helper function to create test objects
const createTestObject = (
  id: string,
  type: ObjectTypeEnum,
  x: number,
  y: number,
  dnaTemplate = type === ObjectTypeEnum.ORGANISM ? HERBIVORE_DNA_TEMPLATE : undefined,
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
  dna: dnaTemplate,
});

describe('calcForceWithAffinity', () => {
  it('calculates force vector correctly with positive affinity', () => {
    const curPosition = new Victor(10, 10);
    const targetPosition = new Victor(20, 20);
    const affinity = 1;
    const forceMultiplier = 10000;

    // Distance between (10,10) and (20,20) is sqrt(200) ≈ 14.14
    // Force = 10000 * 1 / (14.14^2) ≈ 10000/200 = 50
    // Normalized vector is approximately (0.7071, 0.7071)
    // Force vector ≈ (0.7071, 0.7071) * (50, 50) ≈ (35.355, 35.355)

    const result = calcForceWithAffinity(curPosition, targetPosition, affinity, forceMultiplier);

    // The force vector should point FROM current TO target with positive affinity
    expect(result.x).toBeCloseTo(35.355, 1);
    expect(result.y).toBeCloseTo(35.355, 1);
  });

  it('calculates force vector correctly with negative affinity', () => {
    const curPosition = new Victor(10, 10);
    const targetPosition = new Victor(20, 20);
    const affinity = -1;
    const forceMultiplier = 10000;

    // Same distance calculation, but negative affinity should reverse direction
    const result = calcForceWithAffinity(curPosition, targetPosition, affinity, forceMultiplier);

    // The force vector should point FROM target TO current with negative affinity
    expect(result.x).toBeCloseTo(-35.355, 1);
    expect(result.y).toBeCloseTo(-35.355, 1);
  });

  it('scales force by distance squared', () => {
    const curPosition = new Victor(0, 0);
    const nearPosition = new Victor(1, 0);
    const farPosition = new Victor(2, 0);
    const affinity = 1;
    const forceMultiplier = 1;

    const nearForce = calcForceWithAffinity(curPosition, nearPosition, affinity, forceMultiplier);
    const farForce = calcForceWithAffinity(curPosition, farPosition, affinity, forceMultiplier);

    // Near force = 1 * 1 / 1^2 = 1
    // Far force = 1 * 1 / 2^2 = 0.25
    // Near force should be 4x stronger than far force
    expect(nearForce.length()).toBeCloseTo(1);
    expect(farForce.length()).toBeCloseTo(0.25);
    expect(nearForce.length() / farForce.length()).toBeCloseTo(4);
  });

  it('applies the forceMultiplier correctly', () => {
    // Important: We need to create fresh Victor instances for each test since subtract() modifies the vector
    const curPosition1 = new Victor(0, 0);
    const targetPosition1 = new Victor(1, 0);
    const curPosition2 = new Victor(0, 0);
    const targetPosition2 = new Victor(1, 0);
    const affinity = 1;

    const lowMultiplier = calcForceWithAffinity(curPosition1, targetPosition1, affinity, 100);
    const highMultiplier = calcForceWithAffinity(curPosition2, targetPosition2, affinity, 1000);

    // High multiplier should be 10x stronger
    expect(highMultiplier.length() / lowMultiplier.length()).toBeCloseTo(10);
  });
});

describe('calcForce', () => {
  it('uses the affinity from DNA to calculate force between two objects', () => {
    // Create two objects at different positions
    const organism = createTestObject('org1', ObjectTypeEnum.ORGANISM, 10, 10);
    const nutrient = createTestObject('nut1', ObjectTypeEnum.NUTRIENCE, 20, 20);

    // Force should be calculated using the affinity value from the DNA
    const result = calcForce(organism, nutrient);

    // The result should be a Victor with non-zero components
    expect(result).toBeInstanceOf(Victor);
    expect(result.length()).toBeGreaterThan(0);
  });

  it('handles different object types correctly', () => {
    // Create different object types
    const herbivore = createTestObject(
      'herb1',
      ObjectTypeEnum.ORGANISM,
      0,
      0,
      HERBIVORE_DNA_TEMPLATE,
    );
    // Position nutrient to the right (positive X direction)
    const nutrient = createTestObject('nut1', ObjectTypeEnum.NUTRIENCE, 10, 0);

    // Calculate forces between different object pairs
    const herbToNutrient = calcForce(herbivore, nutrient);

    // Herbivore should be attracted to nutrients based on DNA
    expect(herbToNutrient.length()).toBeGreaterThan(0);

    // The direction should match what we expect based on their relative positions
    // With the current implementation, targetPosition.subtract(curPosition) means:
    // - Positive affinity: force points FROM current TO target
    // - Negative affinity: force points FROM target TO current
    if (HERBIVORE_DNA_TEMPLATE.nutrienceAffinity[0] > 0) {
      // If affinity is positive, force should pull toward nutrient (positive x)
      expect(herbToNutrient.x).toBeGreaterThan(0);
    } else if (HERBIVORE_DNA_TEMPLATE.nutrienceAffinity[0] < 0) {
      // If affinity is negative, force should push away from nutrient (negative x)
      expect(herbToNutrient.x).toBeLessThan(0);
    }
  });
});
