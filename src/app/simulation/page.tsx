'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useSimulation, SimulationObject as SimObj } from '@/context/SimulationContext';
import { SimulationObject } from '@/components/SimulationObject';
import { CONTAINER_WIDTH, CONTAINER_HEIGHT } from '@/lib/constants/world';
import { Card } from '@/components/ui/card';
import { Drawer } from '@/components/ui/drawer';

export default function SimulationPage() {
  const { state, dispatch, isInitialized } = useSimulation();
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  // Get the currently selected object
  const selectedObject = state.selectedObjectId
    ? state.steps[state.currentStep].objects.find(obj => obj.id === state.selectedObjectId) || null
    : null;
    
  // Handle closing the drawer
  const handleCloseDrawer = () => {
    dispatch({ type: 'SELECT_OBJECT', payload: null });
  };

  // No click handling as per requirements

  // Start the simulation
  const startSimulation = () => {
    if (!state.isRunning) {
      dispatch({ type: 'START_SIMULATION' });
      
      // Set velocity for the circle
      const mainCircle = state.steps[state.currentStep].objects.find(obj => obj.id === 'circle-2');
      if (mainCircle) {
        // No need to modify anything here now that the simulation works with velocity vectors
        const updatedCircle: SimObj = {
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
      className="w-full h-screen bg-black bg-contain bg-no-repeat bg-center relative overflow-hidden"
    >
      {/* Main content container with transition effect */}
      <div 
        className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-in-out`}
        style={{ 
          transform: selectedObject ? 'translateX(-160px)' : 'translateX(0)'
        }}
      >
      <Card className="relative bg-black rounded-lg border border-white/10" 
        style={{ 
          width: `${CONTAINER_WIDTH}px`, 
          height: `${CONTAINER_HEIGHT}px` 
        }}>

        {/* Only render simulation objects when client-side initialization is complete */}
        {isInitialized && state.steps[state.currentStep].objects.map(obj => (
          <SimulationObject key={obj.id} object={obj} />
        ))}
        
        {/* Show loading state while initializing */}
        {!isInitialized && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <span className="animate-pulse">Initializing simulation...</span>
          </div>
        )}
      </Card>
      
      <div className="fixed top-5 flex gap-2.5 bg-black/40 p-2 px-4 rounded z-10"
           style={{ left: '50%', transform: `translateX(-50%) ${selectedObject ? 'translateX(-80px)' : ''}`, transition: 'transform 300ms ease-in-out' }}>
        <Button 
          onClick={startSimulation} 
          disabled={state.isRunning || !isInitialized}
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
      
      <div className="fixed bottom-5 text-white text-sm bg-black/70 p-2 px-4 rounded pointer-events-none"
           style={{ left: '50%', transform: `translateX(-50%) ${selectedObject ? 'translateX(-80px)' : ''}`, transition: 'transform 300ms ease-in-out' }}>
        {state.isRunning 
          ? 'Simulation running - use controls to pause or reset' 
          : 'Use the controls to start, pause, or reset the simulation'}
      </div>
      
        <div className="fixed top-5 right-5 text-white text-sm bg-black/70 p-2 px-4 rounded"
             style={{ transform: selectedObject ? 'translateX(-160px)' : 'translateX(0)', transition: 'transform 300ms ease-in-out' }}>
          Step: {state.currentStep} / {state.steps.length - 1}
        </div>
      </div>

      {/* Drawer Component */}
      <Drawer 
        isOpen={!!selectedObject} 
        onClose={handleCloseDrawer} 
        selectedObject={selectedObject}
      />
    </div>
  );
}
