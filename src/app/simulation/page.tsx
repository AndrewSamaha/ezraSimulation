'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, ChevronRight } from 'lucide-react';
import { useSimulation, getStepByAbsoluteNumber } from '@/context/SimulationContext';
import type { SimulationObject as SimObj } from '@/lib/simulation/types/SimulationObject';
import { SimulationObject } from '@/components/SimulationObject';
import { CONTAINER_WIDTH, CONTAINER_HEIGHT } from '@/lib/constants/world';
import { Card } from '@/components/ui/card';
import { Drawer } from '@/components/ui/drawer';
import { PerformancePanel } from '@/components/PerformancePanel';
import { SaveStatus } from '@/components/SaveStatus';

export default function SimulationPage() {
  const { state, dispatch, isInitialized } = useSimulation();
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Get the current step data using helper function to handle step offset
  const currentStepData = getStepByAbsoluteNumber(state, state.currentStep);
  
  // Get the currently selected object
  const selectedObject = state.selectedObjectId && currentStepData
    ? currentStepData.objects.find((obj) => obj.id === state.selectedObjectId) || null
    : null;

  // Handle closing the drawer - only used for the close button in the drawer
  const handleCloseDrawer = () => {
    dispatch({ type: 'SELECT_OBJECT', payload: null });
  };

  // Stop event propagation for the controls container
  const handleControlsClick = (e: React.MouseEvent) => {
    // Prevent the click from reaching the backdrop
    e.stopPropagation();
  };

  // No click handling as per requirements

  // Start the simulation
  const startSimulation = (e?: React.MouseEvent) => {
    // Prevent event propagation if it's a mouse event
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (!state.isRunning) {
      dispatch({ type: 'START_SIMULATION' });

      // Set velocity for the circle
      const currentStepData = getStepByAbsoluteNumber(state, state.currentStep);
      const mainCircle = currentStepData?.objects.find(
        (obj) => obj.id === 'circle-2',
      );
      if (mainCircle) {
        // No need to modify anything here now that the simulation works with velocity vectors
        const updatedCircle: SimObj = {
          ...mainCircle,
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
  const pauseSimulation = (e?: React.MouseEvent) => {
    // Prevent event propagation if it's a mouse event
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (state.isRunning) {
      dispatch({ type: 'PAUSE_SIMULATION' });

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    }
  };

  // Reset the simulation
  const resetSimulation = (e?: React.MouseEvent) => {
    // Prevent event propagation if it's a mouse event
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }

    dispatch({ type: 'RESET_SIMULATION' });
  };

  // Removed unused stepSimulation function as it's not being called anywhere

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
      onClick={(e) => {
        // Only close the drawer when clicking on the background itself
        // This prevents clicks on control elements from closing the drawer
        if (e.target === containerRef.current) {
          dispatch({ type: 'SELECT_OBJECT', payload: null });
        }
      }}
    >
      {/* Main content container with transition effect */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-in-out`}
        style={{
          transform: selectedObject ? 'translateX(-160px)' : 'translateX(0)',
        }}
      >
        <Card
          className="relative bg-black rounded-lg border border-white/10"
          style={{
            width: `${CONTAINER_WIDTH}px`,
            height: `${CONTAINER_HEIGHT}px`,
          }}
        >
          {/* Only render simulation objects when client-side initialization is complete */}
          {isInitialized && currentStepData && 
            currentStepData.objects.map((obj) => (
              <SimulationObject
                key={obj.id}
                object={obj}
                // onClick and isSelected are handled by container click events
              />
            ))}
          {/* Show loading state while initializing */}
          {!isInitialized && (
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='text-lg font-medium'>Loading simulation...</div>
            </div>
          )}
        </Card>

        <div
          className='fixed top-5 flex gap-2.5 bg-black/40 p-2 px-4 rounded'
          style={{
            left: '50%',
            transform: `translateX(-50%) ${selectedObject ? 'translateX(-80px)' : ''}`,
            transition: 'transform 300ms ease-in-out',
            zIndex: 100, // Highest z-index to ensure it's above everything else
          }}
          onClick={handleControlsClick}
        >
          <Button
            onClick={startSimulation}
            disabled={state.isRunning || !isInitialized}
            className="bg-white/20 text-white border border-white/30 hover:bg-white/30"
            variant="outline"
            size="icon"
            title="Play simulation"
            data-drawer-exclude="true"
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            onClick={pauseSimulation}
            disabled={!state.isRunning}
            className="bg-white/20 text-white border border-white/30 hover:bg-white/30"
            variant="outline"
            size="icon"
            title="Pause simulation"
            data-drawer-exclude="true"
          >
            <Pause className="h-4 w-4" />
          </Button>
          <Button
            // Use an inline handler that completely bypasses normal event processing
            onMouseDown={(e) => {
              // Stop all event propagation
              e.stopPropagation();
              e.preventDefault();

              if (!state.isRunning && isInitialized) {
                // Store current selection
                const currentSelectionId = state.selectedObjectId;

                // Step the simulation
                dispatch({ type: 'NEXT_STEP' });

                // If we had a selection, immediately re-select it
                if (currentSelectionId) {
                  dispatch({ type: 'SELECT_OBJECT', payload: currentSelectionId });
                }
              }

              // Return false to prevent additional handling
              return false;
            }}
            disabled={state.isRunning || !isInitialized}
            className="bg-white/20 text-white border border-white/30 hover:bg-white/30"
            variant="outline"
            size="icon"
            title="Step forward"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            onClick={resetSimulation}
            className="bg-white/20 text-white border border-white/30 hover:bg-white/30"
            variant="outline"
            size="icon"
            title="Reset simulation"
            data-drawer-exclude="true"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* <div
          className="fixed bottom-5 text-white text-sm bg-black/70 p-2 px-4 rounded pointer-events-none"
          style={{
            left: '50%',
            transform: `translateX(-50%) ${selectedObject ? 'translateX(-80px)' : ''}`,
            transition: 'transform 300ms ease-in-out',
          }}
        >
          {state.isRunning
            ? 'Simulation running - use controls to pause or reset'
            : 'Use the controls to start, pause, or reset the simulation'}
        </div> */}

        <div
          className="fixed top-5 right-5 text-white text-sm bg-black/70 p-2 px-4 rounded space-y-2"
          style={{
            transform: selectedObject ? 'translateX(-220px)' : 'translateX(0)',
            transition: 'transform 300ms ease-in-out',
          }}
        >
          <div>
            Step: {state.currentStep} / {state.currentStep - (state._stepOffset || 0) + (currentStepData ? currentStepData.objects.length - 1 : 0)}
          </div>
          <div>Objects: {currentStepData ? currentStepData.objects.length : 0}</div>

          {/* Save Status Indicator */}
          <div className="mt-2">
            <SaveStatus />
          </div>
        </div>

        {/* Performance Panel */}
        <div
          className="fixed bottom-20 right-5"
          style={{
            transform: selectedObject ? 'translateX(-220px)' : 'translateX(0)',
            transition: 'transform 300ms ease-in-out',
          }}
        >
          <PerformancePanel className="w-60" />
        </div>
      </div>

      {/* Drawer Component */}
      <Drawer
        isOpen={!!selectedObject}
        onClose={handleCloseDrawer}
        selectedObject={selectedObject}
        allObjects={currentStepData ? currentStepData.objects : []}
        dispatch={dispatch}
      />

      {/* Invisible overlay that prevents background clicks from closing drawer when using controls */}
      {!!selectedObject && (
        <div
          className="fixed inset-0 z-30 pointer-events-none"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}
