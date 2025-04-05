'use client';

import { SimulationObject as SimObj } from '@/context/SimulationContext';

interface AnimalProps {
  object: SimObj;
  isHovered: boolean;
}

export function Animal({ object: obj }: AnimalProps) {
  return (
    <div 
      className="absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 
        transition-all duration-200 ease-out cursor-pointer bg-red-500 border-2 
        border-red-500 shadow-animal"
      style={{ 
        left: `${obj.vector.x}px`, 
        top: `${obj.vector.y}px`,
        width: `${obj.size || 50}px`,
        height: `${obj.size || 50}px`,
      }}
    />
  );
}
