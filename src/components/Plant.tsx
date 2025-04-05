'use client';

import { SimulationObject as SimObj } from '@/context/SimulationContext';

interface PlantProps {
  object: SimObj;
  isHovered: boolean;
}

export function Plant({ object: obj }: PlantProps) {
  return (
    <div 
      className="rounded-full transform -translate-x-1/2 -translate-y-1/2 
        transition-all duration-200 ease-out cursor-pointer 
        bg-green-500 border-2 border-green-500 shadow-plant"
      style={{ 
        width: `${obj.size || 50}px`,
        height: `${obj.size || 50}px`,
        opacity: 0.6, // Direct CSS opacity for transparency
        backgroundColor: 'rgba(34, 197, 94, 0.6)', // Green with alpha transparency
        borderColor: 'rgba(34, 197, 94, 0.4)', // Border color with alpha transparency
      }}
    />
  );
}
