'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useSimulation, SimulationObject, ObjectTypeEnum } from '@/context/SimulationContext';

export default function SimulationPage() {
  const { state, dispatch } = useSimulation();
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // No click handling as per requirements

  // Start the simulation
  const startSimulation = () => {
    if (!state.isRunning) {
      dispatch({ type: 'START_SIMULATION' });
      
      // Set velocity for the circle
      const mainCircle = state.steps[state.currentStep].objects.find(obj => obj.id === 'circle-1');
      if (mainCircle) {
        // No need to modify anything here now that the simulation works with velocity vectors
        const updatedCircle: SimulationObject = {
          ...mainCircle
        };
        dispatch({ type: 'UPDATE_OBJECT', payload: updatedCircle });
      }
      
      // Start interval to advance simulation steps
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'NEXT_STEP' });
      }, state.speed);
    }
  };

  // Pause the simulation
  const pauseSimulation = () => {
    if (state.isRunning) {
      dispatch({ type: 'PAUSE_SIMULATION' });
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    }
  };

  // Reset the simulation
  const resetSimulation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    
    dispatch({ type: 'RESET_SIMULATION' });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up interval on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-screen bg-[#000912] relative overflow-hidden"
    >
      {/* Render all objects in the current simulation step */}
      {state.steps[state.currentStep].objects.map(obj => (
        <div key={obj.id}>
          <div 
            className={`absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-out
              ${obj.objectType === ObjectTypeEnum.ANIMAL ? 'bg-red-500 border-2 border-red-500 shadow-animal' : 'bg-green-500 border-2 border-green-500 shadow-plant'}`}
            style={{ 
              left: `${obj.vector.x}px`, 
              top: `${obj.vector.y}px`,
              width: `${obj.size || 50}px`,
              height: `${obj.size || 50}px`
            }}
          />
          <div 
            className="absolute transform -translate-x-1/2 text-white text-xs bg-black/70 p-1 px-2 rounded text-center z-5 pointer-events-none whitespace-nowrap"
            style={{ 
              left: `${obj.vector.x}px`, 
              top: `${obj.vector.y + (obj.size || 50) + 5}px`
            }}
          >
            <div>Type: {obj.objectType}</div>
            <div>Position: ({Math.round(obj.vector.x)}, {Math.round(obj.vector.y)})</div>
            <div>Direction: {Math.round(obj.velocity.angle() * (180/Math.PI))}°</div>
            <div>Speed: {Math.round(obj.velocity.length() * 100) / 100}</div>
          </div>
        </div>
      ))}
      
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 flex gap-2.5 bg-black/40 p-2 px-4 rounded z-10">
        <Button 
          onClick={startSimulation} 
          disabled={state.isRunning}
          className="bg-white/20 text-white border border-white/30 hover:bg-white/30"
          variant="outline"
          size="icon"
        >
          <Play className="h-4 w-4" />
        </Button>
        <Button 
          onClick={pauseSimulation} 
          disabled={!state.isRunning}
          className="bg-white/20 text-white border border-white/30 hover:bg-white/30"
          variant="outline"
          size="icon"
        >
          <Pause className="h-4 w-4" />
        </Button>
        <Button 
          onClick={resetSimulation} 
          className="bg-white/20 text-white border border-white/30 hover:bg-white/30"
          variant="outline"
          size="icon"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/70 p-2 px-4 rounded pointer-events-none">
        {state.isRunning 
          ? 'Simulation running - use controls to pause or reset' 
          : 'Use the controls to start, pause, or reset the simulation'}
      </div>
      
      <div className="absolute top-5 right-5 text-white text-sm bg-black/70 p-2 px-4 rounded">
        Step: {state.currentStep} / {state.steps.length - 1}
      </div>
    </div>
  );
}
