'use client';

import { useState } from 'react';
import { SimulationObject as SimObj, ObjectTypeEnum } from '@/context/SimulationContext';
import { Animal } from './Animal';
import { Plant } from './Plant';

interface SimulationObjectProps {
  object: SimObj;
}

export function SimulationObject({ object: obj }: SimulationObjectProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Determine which component to render based on object type
  const renderAppropriateComponent = () => {
    switch (obj.objectType) {
    case ObjectTypeEnum.ANIMAL:
      return <Animal object={obj} isHovered={isHovered} />;
    case ObjectTypeEnum.PLANT:
      return <Plant object={obj} isHovered={isHovered} />;
    default:
      return null;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Render the appropriate component based on object type */}
      {renderAppropriateComponent()}
      
      {/* Information annotation below the object - only visible on hover */}
      {isHovered && (
        <div 
          className="absolute transform -translate-x-1/2 text-white text-xs bg-black/70 p-1 px-2 rounded text-center z-10 pointer-events-none whitespace-nowrap transition-opacity duration-200"
          style={{ 
            left: `${obj.vector.x}px`, 
            top: `${obj.vector.y + (obj.size || 50) + 5}px`
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
