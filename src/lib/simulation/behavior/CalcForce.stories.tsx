import React, { useState, useRef, useEffect } from 'react';
import { Meta } from '@storybook/react';
import Victor from 'victor';
import { ForceVector } from '../../../components/ForceVector';
import { calcForceWithAffinity, calcForce } from './organism';
import { ObjectTypeEnum } from '../../../context/SimulationContext';
import { 
  PLANT_DNA_TEMPLATE, 
  HERBIVORE_DNA_TEMPLATE, 
  DNA, 
} from '../../simulation/evolution/organism';

// Define the meta for this story
export default {
  title: 'Simulation/CalcForce Sandbox',
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#111' },
      ],
    },
  },
} as Meta;

// Mock SimulationObject type that matches the expected type from SimulationContext
interface SimulationObject {
  id: string;
  objectType: ObjectTypeEnum;
  vector: Victor;
  dna?: DNA; // Use the actual DNA type
  velocity: Victor; // Not optional to match the required type
  forceInput: Victor; // Not optional to match the required type
  age: number;
  parentId: string | null;
  energy: number;
  actionHistory: Array<unknown>; // Use unknown instead of ActionType
}

// Create a mock simulation object
const createMockObject = (
  type: ObjectTypeEnum, 
  position: Victor, 
  overrides: Partial<SimulationObject> = {},
): SimulationObject => ({
  id: `obj-${Math.random().toString(36).substring(2, 9)}`,
  objectType: type,
  vector: position,
  velocity: new Victor(0, 0),
  forceInput: new Victor(0, 0),
  age: 1,
  parentId: null,
  energy: 100,
  actionHistory: [],
  dna: type === ObjectTypeEnum.ORGANISM 
    ? (overrides.dna as DNA || PLANT_DNA_TEMPLATE) 
    : undefined, // Don't assign dna for non-organism types
  ...overrides,
});

// Main story component
export const CalcForceSandbox = () => {
  // Dimensions and refs
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // State for object properties
  const [curObjectType, setCurObjectType] = useState<ObjectTypeEnum>(ObjectTypeEnum.ORGANISM);
  const [targetObjectType, setTargetObjectType] = useState<ObjectTypeEnum>(ObjectTypeEnum.ORGANISM);
  const [curDNAType, setCurDNAType] = useState<'PLANT' | 'HERBIVORE'>('PLANT');
  const [customAffinity, setCustomAffinity] = useState<number | null>(null);
  const [forceMultiplier, setForceMultiplier] = useState<number>(1000); // Default to 1000
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number }>({ x: 400, y: 300 });
  
  // Calculate position for the current object based on dimensions
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const CENTER_POSITION = new Victor(centerX, centerY);
  
  // Create the simulation objects
  const curObject = createMockObject(
    curObjectType, 
    CENTER_POSITION,
    { dna: curDNAType === 'PLANT' ? PLANT_DNA_TEMPLATE : HERBIVORE_DNA_TEMPLATE },
  );
  
  // Ensure target object vector uses mouse position
  const targetObject = createMockObject(
    targetObjectType, 
    new Victor(mousePosition.x, mousePosition.y),
  );
  
  // Ensure curObject's position is centered first
  curObject.vector = CENTER_POSITION.clone();
  
  // Update target object's vector to use mouse position
  targetObject.vector = new Victor(mousePosition.x, mousePosition.y);
  
  // Calculate real distance between center and mouse position
  const affinityDistance = curObject.vector.distance(targetObject.vector);
  
  // Calculate the force - use type assertion to make TypeScript happy
  
  // Extract the values used in calcForce calculations (duplicating the logic from calcForce)
  // Use custom affinity if set, otherwise use the DNA template value
  const affinityValue = customAffinity !== null 
    ? customAffinity 
    : (curDNAType === 'PLANT' 
      ? PLANT_DNA_TEMPLATE[`${targetObjectType}Affinity`][0] 
      : HERBIVORE_DNA_TEMPLATE[`${targetObjectType}Affinity`][0]);
  
  // Use the force multiplier parameter
  const forceVector = calcForceWithAffinity(
    curObject.vector, 
    targetObject.vector, 
    affinityValue, 
    forceMultiplier,
  );
  console.log('forceVector', forceVector);
  // These are the values used in the calcForce function
  
  // Handle mouse movement to update target position
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
  };

  // For touch devices
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current || !e.touches[0]) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    
    setMousePosition({ x, y });
    e.preventDefault(); // Prevent scrolling while touching
  };
  
  // Update dimensions on resize and set the CENTER_POSITION
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    };
    
    // Set default mouse position to the center when first mounting
    setTimeout(() => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setMousePosition({ x: width / 2 + 100, y: height / 2 }); // Offset slightly from center
      }
    }, 100);
    
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Controls Panel */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex flex-wrap gap-6 items-center">
          <div>
            <label className="block text-sm font-medium mb-1">Current Object Type:</label>
            <select 
              value={curObjectType} 
              onChange={(e) => setCurObjectType(e.target.value as ObjectTypeEnum)}
              className="bg-gray-700 text-white px-3 py-1 rounded"
            >
              <option value={ObjectTypeEnum.ORGANISM}>Organism</option>
              <option value={ObjectTypeEnum.NUTRIENCE}>Nutrience</option>
            </select>
          </div>
          
          {curObjectType === ObjectTypeEnum.ORGANISM && (
            <div>
              <label className="block text-sm font-medium mb-1">Current DNA Type:</label>
              <select 
                value={curDNAType} 
                onChange={(e) => setCurDNAType(e.target.value as 'PLANT' | 'HERBIVORE')}
                className="bg-gray-700 text-white px-3 py-1 rounded"
              >
                <option value="PLANT">Plant</option>
                <option value="HERBIVORE">Herbivore</option>
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Target Object Type:</label>
            <select 
              value={targetObjectType} 
              onChange={(e) => setTargetObjectType(e.target.value as ObjectTypeEnum)}
              className="bg-gray-700 text-white px-3 py-1 rounded"
            >
              <option value={ObjectTypeEnum.ORGANISM}>Organism</option>
              <option value={ObjectTypeEnum.NUTRIENCE}>Nutrience</option>
            </select>
          </div>
          
          <div className="w-full max-w-xs">
            <label className="block text-sm font-medium mb-1">
              Affinity: {customAffinity !== null ? customAffinity.toFixed(2) : 'Using DNA value'}
            </label>
            <div className="flex items-center gap-2">
              <input 
                type="range" 
                min="-1" 
                max="1" 
                step="0.1"
                value={customAffinity !== null ? customAffinity : 0}
                onChange={(e) => setCustomAffinity(parseFloat(e.target.value))}
                className="w-full"
              />
              <button 
                onClick={() => setCustomAffinity(null)}
                className="px-2 py-1 bg-gray-600 text-xs rounded hover:bg-gray-500"
              >
                Reset
              </button>
            </div>
          </div>
          
          <div className="w-full max-w-xs">
            <label className="block text-sm font-medium mb-1">
              Force Multiplier: {forceMultiplier.toLocaleString()}
            </label>
            <div className="flex flex-col gap-2">
              <input 
                type="range" 
                min="1" 
                max="100000" 
                step="1"
                value={forceMultiplier}
                onChange={(e) => setForceMultiplier(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex gap-2 text-xs">
                <button 
                  onClick={() => setForceMultiplier(10)}
                  className="px-2 py-1 bg-gray-600 rounded hover:bg-gray-500"
                >
                  10
                </button>
                <button 
                  onClick={() => setForceMultiplier(100)}
                  className="px-2 py-1 bg-gray-600 rounded hover:bg-gray-500"
                >
                  100
                </button>
                <button 
                  onClick={() => setForceMultiplier(1000)}
                  className="px-2 py-1 bg-gray-600 rounded hover:bg-gray-500"
                >
                  1,000
                </button>
                <button 
                  onClick={() => setForceMultiplier(10000)}
                  className="px-2 py-1 bg-gray-600 rounded hover:bg-gray-500"
                >
                  10,000
                </button>
                <button 
                  onClick={() => setForceMultiplier(100000)}
                  className="px-2 py-1 bg-gray-600 rounded hover:bg-gray-500"
                >
                  100,000
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Calculation Display Panel */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 overflow-x-auto">
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="font-semibold">Mouse:</span> 
            ({mousePosition.x.toFixed(0)}, {mousePosition.y.toFixed(0)})
          </div>
          <div>
            <span className="font-semibold">Center:</span> 
            ({centerX.toFixed(0)}, {centerY.toFixed(0)})
          </div>
          <div>
            <span className="font-semibold">Distance:</span> {affinityDistance.toFixed(2)}px
          </div>
          <div>
            <span className="font-semibold">Affinity:</span> {affinityValue} 
            {customAffinity !== null && <span className="text-xs ml-1">(custom)</span>}
          </div>
          <div>
            <span className="font-semibold">Force Multiplier:</span> {forceMultiplier.toLocaleString()}
          </div>
          <div>
            <span className="font-semibold">Force Vector:</span> 
            ({forceVector.x.toFixed(6)}, {forceVector.y.toFixed(6)})
          </div>
          <div>
            <span className="font-semibold">Force Magnitude:</span> 
            {forceVector.length().toFixed(6)}
          </div>
          <div>
            <span className="font-semibold">Force Direction:</span> 
            {(forceVector.angle() * 180 / Math.PI).toFixed(2)}°
          </div>
        </div>
      </div>
      
      {/* Visualization Area */}
      <div 
        ref={containerRef}
        className="flex-grow relative overflow-hidden cursor-crosshair" 
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseEnter={(e) => handleMouseMove(e)}
      >
        {/* Current Object */}
        <div 
          className="absolute rounded-full border-2 flex items-center justify-center text-xs"
          style={{
            left: `${dimensions.width / 2}px`,
            top: `${dimensions.height / 2}px`,
            width: '30px',
            height: '30px',
            backgroundColor: curObjectType === ObjectTypeEnum.ORGANISM 
              ? (curDNAType === 'PLANT' ? 'rgba(0, 200, 0, 0.5)' : 'rgba(0, 0, 200, 0.5)') 
              : 'rgba(200, 200, 0, 0.5)',
            transform: 'translate(-50%, -50%)',
            borderColor: 'white',
            zIndex: 10, // Ensure it's above other elements
          }}
        >
          Cur
        </div>
        
        {/* Target Object */}
        <div 
          className="absolute rounded-full border-2 flex items-center justify-center text-xs"
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
            width: '20px',
            height: '20px',
            backgroundColor: targetObjectType === ObjectTypeEnum.ORGANISM 
              ? 'rgba(0, 100, 200, 0.5)' 
              : 'rgba(200, 200, 0, 0.5)',
            transform: 'translate(-50%, -50%)',
            borderColor: 'white',
          }}
        >
          Tgt
        </div>
        
        {/* Line connecting the objects */}
        <div 
          className="absolute"
          style={{
            left: `${dimensions.width / 2}px`,
            top: `${dimensions.height / 2}px`,
            width: `${affinityDistance}px`,
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            transform: `rotate(${Math.atan2(
              mousePosition.y - dimensions.height / 2,
              mousePosition.x - dimensions.width / 2
            )}rad)`,
            transformOrigin: 'left center',
            zIndex: 5,
          }}
        />
        
        {/* Force Vector Visualization */}
        <div 
          className="absolute"
          style={{
            left: `${dimensions.width / 2}px`,
            top: `${dimensions.height / 2}px`,
            zIndex: 15, // Ensure it's above other elements
          }}
        >
          <ForceVector 
            force={forceVector} 
            color="rgba(255, 100, 0, 0.8)"
            scale={30} // Scaled up for visibility
            thickness={5}
          />
        </div>
      </div>
      
      {/* Instructions */}
      <div className="p-4 bg-gray-800 border-t border-gray-700 text-sm">
        <p>
          Move your mouse to position the target object. The force vector shows the force 
          acting on the current object.
        </p>
        <p className="mt-1">Formula: Force = Affinity / Distance²</p>
      </div>
    </div>
  );
};
