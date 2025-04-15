import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { ForceVector } from './ForceVector';
import Victor from 'victor';

interface ForceVectorStoryProps {
  magnitude: number;
  angle: number;
  color?: string;
  scale?: number;
  thickness?: number;
}

// A wrapper component that allows controlling the force vector
const ForceVectorControl = ({ 
  magnitude = 1,
  angle = 0,
  color,
  scale,
  thickness,
}: ForceVectorStoryProps) => {
  // Calculate force vector from magnitude and angle
  const x = magnitude * Math.cos(angle * Math.PI / 180);
  const y = magnitude * Math.sin(angle * Math.PI / 180);
  const force = new Victor(x, y);
  
  return (
    <div style={{ 
      width: '500px', 
      height: '500px', 
      position: 'relative', 
      background: '#111', 
      borderRadius: '8px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div style={{ position: 'relative' }}>
        {/* Center dot */}
        <div style={{ 
          width: '10px', 
          height: '10px', 
          background: '#ffffff', 
          borderRadius: '50%',
          position: 'absolute',
          top: '-5px',
          left: '-5px',
          zIndex: 10,
        }} />
        <ForceVector 
          force={force} 
          color={color} 
          scale={scale}
          thickness={thickness}
        />
      </div>
    </div>
  );
};

// Component that allows interactive control of the force vector
const InteractiveForceVector = () => {
  const [magnitude, setMagnitude] = useState(5);
  const [angle, setAngle] = useState(45);
  const [color, setColor] = useState('rgba(255, 165, 0, 0.8)');
  const [scale, setScale] = useState(10);
  const [thickness, setThickness] = useState(2);
  
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
          <label htmlFor="magnitude" style={{ color: 'white', marginRight: '10px' }}>
            Magnitude: {magnitude}
          </label>
          <input 
            id="magnitude"
            type="range" 
            min="0" 
            max="10" 
            step="0.1"
            value={magnitude} 
            onChange={(e) => setMagnitude(parseFloat(e.target.value))} 
          />
        </div>
        
        <div>
          <label htmlFor="angle" style={{ color: 'white', marginRight: '10px' }}>
            Angle: {angle}°
          </label>
          <input 
            id="angle"
            type="range" 
            min="0" 
            max="360" 
            step="1"
            value={angle} 
            onChange={(e) => setAngle(parseFloat(e.target.value))} 
          />
        </div>
        
        <div>
          <label htmlFor="scale" style={{ color: 'white', marginRight: '10px' }}>
            Scale: {scale}
          </label>
          <input 
            id="scale"
            type="range" 
            min="1" 
            max="20" 
            step="1"
            value={scale} 
            onChange={(e) => setScale(parseFloat(e.target.value))} 
          />
        </div>
        
        <div>
          <label htmlFor="thickness" style={{ color: 'white', marginRight: '10px' }}>
            Thickness: {thickness}
          </label>
          <input 
            id="thickness"
            type="range" 
            min="1" 
            max="5" 
            step="1"
            value={thickness} 
            onChange={(e) => setThickness(parseFloat(e.target.value))} 
          />
        </div>
        
        <div>
          <label htmlFor="color" style={{ color: 'white', marginRight: '10px' }}>
            Color:
          </label>
          <select 
            id="color"
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            style={{ padding: '5px' }}
          >
            <option value="rgba(255, 165, 0, 0.8)">Orange</option>
            <option value="rgba(255, 0, 0, 0.8)">Red</option>
            <option value="rgba(0, 255, 0, 0.8)">Green</option>
            <option value="rgba(0, 0, 255, 0.8)">Blue</option>
            <option value="rgba(255, 255, 255, 0.8)">White</option>
          </select>
        </div>
      </div>
      
      <ForceVectorControl 
        magnitude={magnitude}
        angle={angle}
        color={color}
        scale={scale}
        thickness={thickness}
      />
    </div>
  );
};

// Define the meta for this component
const meta: Meta<typeof ForceVectorControl> = {
  title: 'Components/ForceVector',
  component: ForceVectorControl,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ForceVectorControl>;

// Basic examples with different angles and magnitudes
export const Right: Story = {
  args: {
    magnitude: 5,
    angle: 0,
    scale: 10,
  },
};

export const Up: Story = {
  args: {
    magnitude: 5,
    angle: 270,
    scale: 10,
  },
};

export const UpRight: Story = {
  args: {
    magnitude: 5,
    angle: 315,
    scale: 10,
  },
};

export const Strong: Story = {
  args: {
    magnitude: 10,
    angle: 45,
    scale: 10,
    thickness: 3,
    color: 'rgba(255, 0, 0, 0.8)',
  },
};

export const Weak: Story = {
  args: {
    magnitude: 2,
    angle: 135,
    scale: 10,
    thickness: 1,
    color: 'rgba(0, 255, 0, 0.8)',
  },
};

// Interactive story with controls
export const Interactive: StoryObj = {
  render: () => <InteractiveForceVector />,
};
