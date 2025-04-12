'use client';

import { useState } from 'react';
import { 
  SimulationObject as SimObj, 
  ObjectTypeEnum, 
  useSimulation 
} from '@/context/SimulationContext';
import { Organism } from './Organism';
import { Nutrience } from './Nutrience';
import { ForceVector } from './ForceVector';

interface SimulationObjectProps {
  object: SimObj;
  showForceVector?: boolean;
}

export function SimulationObject({ object: obj, showForceVector = false }: SimulationObjectProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { dispatch, state } = useSimulation();
  const isSelected = state.selectedObjectId === obj.id;
  
  // Determine which component to render based on object type
  const renderAppropriateComponent = () => {
    switch (obj.objectType) {
    case ObjectTypeEnum.ORGANISM:
      return <Organism object={obj} isHovered={isHovered} />;
    case ObjectTypeEnum.NUTRIENCE:
      return <Nutrience object={obj} isHovered={isHovered} />;
    default:
      return null;
    }
  };

  return (
    <div
      className="absolute" 
      style={{ 
        left: `${obj.vector.x}px`, 
        top: `${obj.vector.y}px`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => dispatch({ type: 'SELECT_OBJECT', payload: obj.id })}
      aria-selected={isSelected}
    >
      {/* Render the appropriate component based on object type */}
      {renderAppropriateComponent()}
      
      {/* Force vector arrow (if enabled) */}
      {showForceVector && obj.forceInput && (
        <ForceVector force={obj.forceInput} />
      )}
      
      {/* Information annotation below the object - only visible on hover */}
      {isHovered && (
        <div 
          className="absolute transform -translate-x-1/2 text-white text-xs bg-black/70 p-1 px-2 rounded 
            text-center z-10 pointer-events-none whitespace-nowrap transition-opacity duration-200"
          style={{ 
            left: 0, 
            top: `${(obj.size || 50) + 5}px`,
          }}
        >
          <div>Type: {obj.objectType}</div>
          <div>Position: ({Math.round(obj.vector.x)}, {Math.round(obj.vector.y)})</div>
          <div>Direction: {Math.round(obj.velocity.angle() * (180/Math.PI))}°</div>
          <div>Speed: {Math.round(obj.velocity.length() * 100) / 100}</div>
          <div>Age: {obj.age}</div>
        </div>
      )}
    </div>
  );
}
