import { v4 as uuidv4 } from 'uuid';

// These factory functions create mock data for testing

export function createMockSimulation(overrides = {}) {
  return {
    id: uuidv4(),
    name: 'Test Simulation',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastStep: 0,
    configuration: {},
    ...overrides
  };
}

export function createMockSimulationStep(overrides = {}) {
  return {
    id: 1,
    simulationId: uuidv4(),
    stepNumber: 1,
    stepData: { objects: [] },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

export function createMockSimulationObject(overrides = {}) {
  return {
    id: uuidv4(),
    objectType: 'ORGANISM',
    vector: { x: 100, y: 100 },
    velocity: { x: 0, y: 0 },
    size: 10,
    color: '#FF0000',
    age: 0,
    forceInput: { x: 0, y: 0 },
    parentId: null,
    energy: 100,
    actionHistory: [],
    workingMemory: [],
    generation: 1,
    ...overrides
  };
}

export function createMockPerformanceMetrics(overrides = {}) {
  return {
    id: 1,
    simulationId: uuidv4(),
    stepNumber: 1,
    frameDuration: 16,
    organismCalculationTime: 5,
    fps: 60,
    createdAt: new Date(),
    ...overrides
  };
}
