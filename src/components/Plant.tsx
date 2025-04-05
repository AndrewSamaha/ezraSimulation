'use client';

import { SimulationObject as SimObj } from '@/context/SimulationContext';

interface PlantProps {
  object: SimObj;
  isHovered: boolean;
}

export function Plant({ object: obj }: PlantProps) {
  return (
    <div 
      className="absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 
        transition-all duration-200 ease-out cursor-pointer bg-green-500 border-2 
        border-green-500 shadow-plant"
      style={{ 
        left: `${obj.vector.x}px`, 
        top: `${obj.vector.y}px`,
        width: `${obj.size || 50}px`,
        height: `${obj.size || 50}px`,
      }}
    />
  );
}
