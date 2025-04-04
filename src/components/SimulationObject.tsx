'use client';

import { useState } from 'react';
import { SimulationObject as SimObj, ObjectTypeEnum } from '@/context/SimulationContext';

interface SimulationObjectProps {
  object: SimObj;
}

export function SimulationObject({ object: obj }: SimulationObjectProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div>
      {/* The actual object circle */}
      <div 
        className={`absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-out cursor-pointer
          ${obj.objectType === ObjectTypeEnum.ANIMAL ? 'bg-red-500 border-2 border-red-500 shadow-animal' : 'bg-green-500 border-2 border-green-500 shadow-plant'}`}
        style={{ 
          left: `${obj.vector.x}px`, 
          top: `${obj.vector.y}px`,
          width: `${obj.size || 50}px`,
          height: `${obj.size || 50}px`
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      
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
