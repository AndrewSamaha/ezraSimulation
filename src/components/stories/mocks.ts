import Victor from 'victor';
import { ObjectTypeEnum } from '@/context/SimulationContext';
import { HERBIVORE_DNA_TEMPLATE, PLANT_DNA_TEMPLATE } from '@/lib/simulation/evolution/organism';

// Create mock objects for our stories
export const createMockObject = (type = ObjectTypeEnum.ORGANISM, overrides = {}) => {
  const baseObject = {
    id: `mock-${type}-${Math.random().toString(36).substring(2, 9)}`,
    objectType: type,
    age: Math.floor(Math.random() * 20) + 1,
    vector: new Victor(250, 250),
    velocity: new Victor(Math.random() * 2 - 1, Math.random() * 2 - 1),
    forceInput: new Victor(0, 0),
    parentId: null,
    energy: Math.floor(Math.random() * 100) + 20,
    actionHistory: [],
    ...overrides
  };

  // Add DNA only to organisms
  if (type === ObjectTypeEnum.ORGANISM) {
    if (!overrides.dna) {
      baseObject.dna = Math.random() > 0.5 ? PLANT_DNA_TEMPLATE : HERBIVORE_DNA_TEMPLATE;
    }
    if (!overrides.color) {
      baseObject.color = baseObject.dna === PLANT_DNA_TEMPLATE ? '#8AFF8A' : '#8A8AFF';
    }
    if (!overrides.size) {
      baseObject.size = baseObject.dna === PLANT_DNA_TEMPLATE ? 15 : 18;
    }
  } else if (type === ObjectTypeEnum.NUTRIENCE) {
    if (!overrides.color) {
      baseObject.color = '#FFFF8A';
    }
    if (!overrides.size) {
      baseObject.size = 8;
    }
  }

  return baseObject;
};
