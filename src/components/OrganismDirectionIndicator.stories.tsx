import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Organism } from './Organism';
import Victor from 'victor';
import { ObjectTypeEnum } from '@/context/SimulationContext';

// Mock SimObj type (adjust import if needed)
type SimObj = {
  id: string;
  objectType: ObjectTypeEnum;
  size?: number;
  velocity: Victor;
};

const meta: Meta<typeof Organism> = {
  title: 'Simulation/OrganismDirectionIndicator',
  component: Organism,
};
export default meta;

type Story = StoryObj<typeof Organism>;

export const Interactive: Story = {
  render: () => {
    const [vx, setVx] = useState(1);
    const [vy, setVy] = useState(1);
    const [size, setSize] = useState(60);

    // Build the mock object
    const organismObj: SimObj = {
      id: 'mock-organism',
      objectType: ObjectTypeEnum.ORGANISM,
      size,
      velocity: new Victor(vx, vy),
    };

    return (
      <div style={{ padding: 30 }}>
        <div style={{ marginBottom: 16 }}>
          <label>
            Velocity X:
            <input
              type="range"
              min={-5}
              max={5}
              step={0.1}
              value={vx}
              onChange={e => setVx(Number(e.target.value))}
              style={{ width: 200 }}
            />
            <span style={{ marginLeft: 8 }}>{vx}</span>
          </label>
          <br />
          <label>
            Velocity Y:
            <input
              type="range"
              min={-5}
              max={5}
              step={0.1}
              value={vy}
              onChange={e => setVy(Number(e.target.value))}
              style={{ width: 200 }}
            />
            <span style={{ marginLeft: 8 }}>{vy}</span>
          </label>
          <br />
          <label>
            Size:
            <input
              type="range"
              min={20}
              max={120}
              step={1}
              value={size}
              onChange={e => setSize(Number(e.target.value))}
              style={{ width: 200 }}
            />
            <span style={{ marginLeft: 8 }}>{size}</span>
          </label>
        </div>
        <Organism object={organismObj as any} isHovered={false} />
      </div>
    );
  },
};
