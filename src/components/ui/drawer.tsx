'use client';

import React from 'react';
import { SimulationObject } from '@/context/SimulationContext';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedObject: SimulationObject | null;
  allObjects: SimulationObject[];
  dispatch: React.Dispatch<{ type: 'SELECT_OBJECT'; payload: string | null }>;
}

export function Drawer({ isOpen, onClose, selectedObject, allObjects, dispatch }: DrawerProps) {
  if (!isOpen || !selectedObject) return null;
  
  // Handle object selection from dropdown
  const handleObjectSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const objectId = event.target.value;
    dispatch({ type: 'SELECT_OBJECT', payload: objectId });
  };
  
  // Convert vector to readable format
  const formatVector = (vector: any) => {
    return `(${Math.round(vector.x)}, ${Math.round(vector.y)})`;
  };

  // This drawer doesn't use a backdrop that blocks controls
  // It simply renders the drawer panel itself

  return (
    <>
      {/* Drawer panel only - no backdrop that blocks controls */}
      <div 
        className={'fixed right-0 top-0 h-full bg-gray-900 text-white shadow-lg w-96 transform transition-transform duration-300 ease-in-out overflow-auto'}
        style={{ 
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          zIndex: 40,  // High z-index but not higher than controls
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <select 
            id="object-select" 
            value={selectedObject.id}
            onChange={handleObjectSelect}
            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
          >
            {allObjects.map((obj) => (
              <option key={obj.id} value={obj.id}>
                {obj.objectType.charAt(0).toUpperCase() + obj.objectType.slice(1)}{' '}
                {obj.id.substring(0, 8)}...{' '}
                {obj.dna ? `(${obj.dna.lineageName || 'Unknown'})` : ''}
              </option>
            ))}
          </select>
          {/* <h2 className="text-xl font-semibold">
            {selectedObject.objectType.charAt(0).toUpperCase() + selectedObject.objectType.slice(1)} Details
          </h2> */}
          <button 
            onClick={onClose} 
            className="rounded-full p-1 hover:bg-gray-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="space-y-4">
            {/* Object preview */}
            {/* <div className="flex justify-center mb-6">
              <div 
                className="rounded-full" 
                style={{ 
                  backgroundColor: selectedObject.color || 'gray',
                  width: `${selectedObject.size || 20}px`, 
                  height: `${selectedObject.size || 20}px`,
                  border: '2px solid white',
                  boxShadow: '0 0 15px rgba(255,255,255,0.5)',
                }}
              />
            </div> */}
            
            {/* <div className="border-b border-gray-700 mb-4"></div> */}
            <div className="grid grid-cols-[1fr_2fr] gap-2">
              <div className="font-semibold">ID:</div>
              <div className="truncate font-mono text-xs">{selectedObject.id}</div>
              
              <div className="font-semibold">Type:</div>
              <div>{selectedObject.objectType}</div>
              
              <div className="font-semibold">Color:</div>
              <div className="flex items-center">
                {selectedObject.color && (
                  <span 
                    className="inline-block w-4 h-4 mr-2 rounded-full" 
                    style={{ backgroundColor: selectedObject.color }}
                  />
                )}
                {selectedObject.color || 'None'}
              </div>
              
              <div className="font-semibold">Size:</div>
              <div>{selectedObject.size || 'Default'}</div>
              
              <div className="font-semibold">Age:</div>
              <div>{selectedObject.age}</div>

              <div className="font-semibold">Energy:</div>
              <div>{Math.round(selectedObject.energy)}</div>
              
              <div className="font-semibold">Position:</div>
              <div>{formatVector(selectedObject.vector)}</div>
              
              <div className="font-semibold">Velocity:</div>
              <div>
                {formatVector(selectedObject.velocity)} 
                <span className="ml-1 text-xs text-gray-500">
                  ({Math.round(selectedObject.velocity.length() * 100) / 100} units/step)
                </span>
              </div>
              
              <div className="font-semibold">Direction:</div>
              <div>{Math.round(selectedObject.velocity.angle() * (180/Math.PI))}°</div>
              
              <div className="font-semibold">Force Input:</div>
              <div>{formatVector(selectedObject.forceInput)}</div>
              
              <div className="font-semibold">Parent ID:</div>
              <div className="truncate">{selectedObject.parentId || 'None'}</div>
            </div>
            
            {/* DNA Information */}
            {selectedObject.dna && (
              <div className="mt-6">
                <details className="mt-4">
                  <summary className="cursor-pointer p-2 bg-gray-800 rounded">
                    View DNA Information
                  </summary>
                  <pre className="p-2 bg-gray-950 rounded mt-2 text-xs overflow-auto max-h-60 border border-gray-800">
                    {JSON.stringify(selectedObject.dna, null, 2)}
                  </pre>
                </details>
              </div>
            )}
            
            {/* JSON representation for debugging */}
            <div className="mt-6">
              <details className="mt-4">
                <summary className="cursor-pointer p-2 bg-gray-800 rounded">
                  View Raw JSON
                </summary>
                <pre className="p-2 bg-gray-950 rounded mt-2 text-xs overflow-auto max-h-60 border border-gray-800">
                  {JSON.stringify(selectedObject, (key, value) => {
                    // Handle Victor objects specially
                    if (value && typeof value === 'object' && 'x' in value && 'y' in value) {
                      return `Vector(${value.x}, ${value.y})`;
                    }
                    return value;
                  }, 2)}
                </pre>
              </details>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
