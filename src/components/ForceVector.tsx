'use client';

import Victor from 'victor';

interface ForceVectorProps {
  force: Victor;
  color?: string;
  scale?: number;
  thickness?: number;
}

export function ForceVector({ 
  force, 
  color = 'rgba(255, 165, 0, 0.8)', // Default orange with transparency
  scale = 10, // Scale factor to make the vector visible
  thickness = 5, // Increased default thickness from 3 to 5
}: ForceVectorProps) {
  if (!force || force.length() === 0) {
    return null; // Don't render if there's no force
  }

  // Calculate arrow dimensions
  const magnitude = force.length() * scale;
  const angle = force.angle();
  
  // Arrow line
  const arrowWidth = thickness;
  
  // Arrow head
  const arrowHeadWidth = arrowWidth * 3;
  const arrowHeadLength = magnitude / 4; // Arrow head is 1/4 of total length
  const lineLength = magnitude - arrowHeadLength; // Reduce line length to avoid overlap
  
  return (
    <div className="absolute top-0 left-0 pointer-events-none" 
      style={{ 
        width: '0', 
        height: '0',
        zIndex: 5,
      }}
    >
      {/* Line part of the arrow */}
      <div
        className="absolute origin-left"
        style={{
          width: `${lineLength}px`,
          height: `${arrowWidth}px`,
          backgroundColor: color,
          transform: `rotate(${angle}rad)`,
          transformOrigin: 'center left',
        }}
      />
      
      {/* Arrow head - with positioning adjustment */}
      <div
        className="absolute origin-left"
        style={{
          width: 0,
          height: 0,
          marginTop: `-${arrowHeadWidth/4}px`, /* Add vertical adjustment to center the arrowhead */
          borderTop: `${arrowHeadWidth/2}px solid transparent`,
          borderBottom: `${arrowHeadWidth/2}px solid transparent`,
          borderLeft: `${arrowHeadLength}px solid ${color}`,
          transform: `rotate(${angle}rad) translateX(${lineLength}px)`,
          transformOrigin: 'left center', /* Change to left center for better rotation */
        }}
      />
    </div>
  );
}
