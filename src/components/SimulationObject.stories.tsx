import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { SimulationObject } from './SimulationObject';
import { ObjectTypeEnum } from '@/lib/simulation/types/SimulationObject';
import Victor from 'victor';
import { SimulationProvider } from '@/context/SimulationContext';
import { HERBIVORE_DNA_TEMPLATE, PLANT_DNA_TEMPLATE } from '@/lib/simulation/evolution/organism';

// Define types for our mock objects
type SimulationObjectType = {
  id: string;
  objectType: ObjectTypeEnum;
  age: number;
  vector: Victor;
  velocity: Victor;
  forceInput: Victor;
  parentId: string | null;
  energy: number;
  actionHistory: any[];
  dna?: any;
  color?: string;
  size?: number;
};

// Helper function to create mock simulation objects
const createMockObject = (type = ObjectTypeEnum.ORGANISM, overrides: Partial<SimulationObjectType> = {}): SimulationObjectType => {
  const baseObject: SimulationObjectType = {
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

  // Add type-specific properties
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

// Create a wrapper component that provides the necessary context
const SimulationObjectWrapper = ({ object }: { object: SimulationObjectType }) => {
  return (
    <div style={{ width: '500px', height: '500px', position: 'relative', background: '#111', borderRadius: '8px' }}>
      <SimulationProvider>
        <SimulationObject object={object} />
      </SimulationProvider>
    </div>
  );
};

// Define the meta for this component
const meta: Meta<typeof SimulationObjectWrapper> = {
  title: 'Components/SimulationObject',
  component: SimulationObjectWrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SimulationObjectWrapper>;

// Export stories
export const Plant: Story = {
  render: () => {
    const plantObject = createMockObject(ObjectTypeEnum.ORGANISM, {
      dna: PLANT_DNA_TEMPLATE,
      color: '#8AFF8A',
      size: 15,
      velocity: new Victor(0.1, 0.2)
    });
    return <SimulationObjectWrapper object={plantObject} />;
  }
};

export const Herbivore: Story = {
  render: () => {
    const herbivoreObject = createMockObject(ObjectTypeEnum.ORGANISM, {
      dna: HERBIVORE_DNA_TEMPLATE,
      color: '#8A8AFF',
      size: 18,
      velocity: new Victor(0.8, 0.4)
    });
    return <SimulationObjectWrapper object={herbivoreObject} />;
  }
};

export const Nutrience: Story = {
  render: () => {
    const nutrienceObject = createMockObject(ObjectTypeEnum.NUTRIENCE, {
      color: '#FFFF8A',
      size: 8,
      velocity: new Victor(0, 0)
    });
    return <SimulationObjectWrapper object={nutrienceObject} />;
  }
};

export const MovingFast: Story = {
  render: () => {
    const fastObject = createMockObject(ObjectTypeEnum.ORGANISM, {
      velocity: new Victor(3, 2),
      size: 20,
      color: '#FF8A8A'
    });
    return <SimulationObjectWrapper object={fastObject} />;
  }
};

export const Large: Story = {
  render: () => {
    const largeObject = createMockObject(ObjectTypeEnum.ORGANISM, {
      size: 40,
      color: '#FF8AFF',
      velocity: new Victor(0.5, 0.5)
    });
    return <SimulationObjectWrapper object={largeObject} />;
  }
};


