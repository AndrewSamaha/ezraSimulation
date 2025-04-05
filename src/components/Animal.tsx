'use client';

import { SimulationObject as SimObj } from '@/context/SimulationContext';

interface AnimalProps {
  object: SimObj;
  isHovered: boolean;
}

export function Animal({ object: obj }: AnimalProps) {
  // Calculate the position of the direction indicator (smaller circle)
  const mainSize = obj.size || 50;
  const indicatorSize = mainSize * 0.3; // Smaller circle is 30% the size of the main circle
  
  // Get the direction and magnitude from velocity vector
  const velocityMagnitude = obj.velocity.length();
  // Normalize the magnitude to be between 0 and 0.35 (max distance from center as 
  // fraction of radius)
  const maxSpeed = 5; // Assuming a reasonable max speed
  const normalizedMagnitude = Math.min(velocityMagnitude / maxSpeed, 1) * 0.35;
  
  // Calculate position offset from center based on velocity direction and magnitude
  // The angle of the velocity vector determines the direction
  // The magnitude determines how far from center (but always within the circle)
  const offsetX = Math.cos(obj.velocity.angle()) * normalizedMagnitude * (mainSize / 2);
  const offsetY = Math.sin(obj.velocity.angle()) * normalizedMagnitude * (mainSize / 2);
  
  // Position relative to center of main circle
  const indicatorLeft = mainSize / 2 + offsetX - (indicatorSize / 2);
  const indicatorTop = mainSize / 2 + offsetY - (indicatorSize / 2);
  
  return (
    <div 
      className="absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 
        transition-all duration-200 ease-out cursor-pointer bg-red-500 border-2 
        border-red-500 shadow-animal relative overflow-visible"
      style={{ 
        left: `${obj.vector.x}px`, 
        top: `${obj.vector.y}px`,
        width: `${mainSize}px`,
        height: `${mainSize}px`,
      }}
    >
      {/* Direction indicator (smaller circle) */}
      <div
        className="absolute bg-white rounded-full"
        style={{
          width: `${indicatorSize}px`,
          height: `${indicatorSize}px`,
          left: `${indicatorLeft}px`,
          top: `${indicatorTop}px`,
        }}
      />
    </div>
  );
}
