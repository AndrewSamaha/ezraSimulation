import React, { useState } from 'react';
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

// Interactive component that allows force vector control
const SimulationObjectWithForceControl = () => {
  const [objectType, setObjectType] = useState<ObjectTypeEnum>(ObjectTypeEnum.ORGANISM);
  const [forceMagnitude, setForceMagnitude] = useState(5);
  const [forceAngle, setForceAngle] = useState(45);
  const [size, setSize] = useState(20);
  
  // Calculate force vector from magnitude and angle
  const forceX = forceMagnitude * Math.cos(forceAngle * Math.PI / 180);
  const forceY = forceMagnitude * Math.sin(forceAngle * Math.PI / 180);
  
  // Create the simulation object with the force vector
  const simulationObject = createMockObject(objectType, {
    forceInput: new Victor(forceX, forceY),
    size: size,
    // Place in the middle
    vector: new Victor(250, 250),
  });
  
  return (
    <div>
      <div style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px',
        width: '500px',
      }}>
        <div>
          <label htmlFor="objectType" style={{ color: 'white', marginRight: '10px' }}>
            Object Type:
          </label>
          <select 
            id="objectType"
            value={objectType} 
            onChange={(e) => setObjectType(e.target.value as ObjectTypeEnum)}
            style={{ padding: '5px' }}
          >
            <option value={ObjectTypeEnum.ORGANISM}>Organism</option>
            <option value={ObjectTypeEnum.NUTRIENCE}>Nutrience</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="size" style={{ color: 'white', marginRight: '10px' }}>
            Size: {size}
          </label>
          <input 
            id="size"
            type="range" 
            min="5" 
            max="50" 
            step="1"
            value={size} 
            onChange={(e) => setSize(parseInt(e.target.value))} 
          />
        </div>
        
        <div>
          <label htmlFor="forceMagnitude" style={{ color: 'white', marginRight: '10px' }}>
            Force Magnitude: {forceMagnitude}
          </label>
          <input 
            id="forceMagnitude"
            type="range" 
            min="0" 
            max="10" 
            step="0.1"
            value={forceMagnitude} 
            onChange={(e) => setForceMagnitude(parseFloat(e.target.value))} 
          />
        </div>
        
        <div>
          <label htmlFor="forceAngle" style={{ color: 'white', marginRight: '10px' }}>
            Force Angle: {forceAngle}°
          </label>
          <input 
            id="forceAngle"
            type="range" 
            min="0" 
            max="360" 
            step="1"
            value={forceAngle} 
            onChange={(e) => setForceAngle(parseInt(e.target.value))} 
          />
        </div>
      </div>
      
      <div style={{ 
        width: '500px', 
        height: '500px', 
        position: 'relative', 
        background: '#111', 
        borderRadius: '8px' 
      }}>
        <SimulationProvider>
          <SimulationObject 
            object={simulationObject} 
            showForceVector={true}
          />
        </SimulationProvider>
      </div>
    </div>
  );
};

// Define the meta for this component
const meta: Meta = {
  title: 'Components/SimulationObjectWithForce',
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
};

export default meta;

// Interactive story with controls
export const Interactive: StoryObj = {
  render: () => <SimulationObjectWithForceControl />,
};
